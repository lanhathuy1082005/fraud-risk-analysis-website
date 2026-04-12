from fastapi import APIRouter, Depends, HTTPException, Query, Request
from datetime import date, datetime, timezone, timedelta
from core.deps import SessionDep, get_current_user
from core.config import settings
from sqlmodel import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError
from models import Transaction, TransactionInput, TransactionPublic, TransactionSummary, CustomerInput, DeviceInput, MerchantInput, Category, Gender, Review
from services.ml_pipeline import get_conf_score, get_risk_score
from services.transactions import upsert_customer,upsert_device,upsert_merchant, upsert_customer_category, upsert_customer_device
from utils.statistics import get_last_5_txn, get_recent_txn_count
import random

router = APIRouter(prefix="/transactions", dependencies=[Depends(get_current_user)])

@router.get("/", response_model=list[TransactionPublic])
def get_transactions(  session: SessionDep , page : int = Query(default=1, ge=1), limit : int = Query(default=10, ge=1, le=100)):

    skip = ( page - 1 ) * limit
    transactions = session.exec(
        select(Transaction)
        .options(selectinload(Transaction.merchant))
        .options(selectinload(Transaction.customer))
        .options(selectinload(Transaction.device))
        .options(selectinload(Transaction.review))
        .offset(skip).limit(limit)).all()
    
    result = [
    TransactionPublic(
        amount=t.amount, time=t.time, category=t.category,
        id=t.id, uuid=t.uuid, customer_id=t.customer.id, 
        merchant_name=t.merchant.name, device_type=t.device.name,
        review_id=t.review_id,
        transaction_status=t.review.status if t.review else None,
        risk_score=t.risk_score, confidence_score=t.confidence_score
    )
    for t in transactions]

    return result

def get_txn_status(risk: float, conf: float):
    if risk > 0.85 and conf > 0.85:
        return 'blocked' 
    
    if risk < 0.4 and conf < 0.4:
        return 'approved'
    
    return None


@router.post("/")
def create_transaction( txn_data: TransactionInput, request: Request, session: SessionDep):
    try:
        if txn_data.amount <= 0:
            raise ValueError("amount can't be lower than or equal to 0")
        
        if not txn_data.time:
            txn_data.time = datetime.now(timezone.utc)

        #upsert device
        device = upsert_device(device_data=DeviceInput(name=txn_data.device_name), session=session)

        # upsert merchant
        merchant = upsert_merchant(merchant_data=MerchantInput(name= txn_data.merchant_name), session=session)

        # upsert customer & calculate z_scores
        customer, z_scores = upsert_customer(device=device, 
                                            customer_data=CustomerInput(id=txn_data.customer_id,
                                            dob=txn_data.customer_dob,
                                            gender=txn_data.customer_gender,
                                            amount=txn_data.amount,
                                            time=txn_data.time), session=session)
        if not customer:
            raise ValueError("Cannot complete transaction due to transaction being earlier than the last")
        
        #upsert junction tables (retrieving customer primary device and categories for risk calculation)
        c_d_data = upsert_customer_device(device=device,customer=customer,session=session)

        c_c_data = upsert_customer_category(txn_data=txn_data, customer=customer, session=session)
    

        last_5_txn = get_last_5_txn(customer_id=customer.id,session=session)

        #last 10 hours (10 steps)
        recent_txn_count = get_recent_txn_count(entered_date=txn_data.time,customer_id=customer.id,session=session)

        customer_merchant_freq = session.exec(
            select(func.count(Transaction.id))
            .where(Transaction.customer_id == customer.id)
            .where(Transaction.merchant_id == merchant.id)
        ).one()
    

        txn_summary = TransactionSummary(last_5_txn=last_5_txn,
                                        avg_amount=customer.avg_amount,
                                        txn_count=customer.txn_count,
                                        recent_txn_count=recent_txn_count,
                                        merchant_freq=customer_merchant_freq)

        #infering to the models
        risk_score = get_risk_score(app= request.app, txn_data= txn_data, txn_summary=txn_summary)
        confidence_score = get_conf_score(z_scores=z_scores,
                                    txn_data=txn_data,
                                    customer=customer,
                                    c_d_data=c_d_data,
                                    c_c_data=c_c_data)
        
        txn_status = get_txn_status(risk=risk_score,conf=confidence_score)

        review_id = None
        if txn_status is not None:
            auto_review = Review(status=txn_status)
            session.add(auto_review)
            session.flush()
            session.refresh(auto_review)
            review_id = auto_review.id
            
        new_transaction = Transaction(amount=txn_data.amount,
                                    time=txn_data.time,
                                    category=txn_data.category,
                                    merchant_id=merchant.id,
                                    customer_id=customer.id,
                                    review_id= review_id,
                                    device_id=device.id,
                                    risk_score=risk_score,
                                    confidence_score=confidence_score)
        
        session.add(new_transaction)
        session.commit()

        return {"msg":"transaction_created"}
    except IntegrityError as e:
        session.rollback()
        print(e.orig)
        raise HTTPException(status_code=409, detail="Conflict, try again")
    except ValueError as e:
        session.rollback()
        print(e)
        raise HTTPException(status_code=400, detail=str(e))
    except KeyError:
        session.rollback()
        raise HTTPException(status_code=400, detail="Invalid model")
    
CUSTOMERS = {}

@router.get("/mock")
def mock_transactions(request: Request, session: SessionDep, count: int = Query(default=50, ge=1, le=5000)):
    DEVICES = ["Phone", "Tablet", "Desktop", "Unknown"]
    MERCHANTS = [
        "Amazon", "Walmart", "Target", "BestBuy", "Starbucks",
        "McDonalds", "Uber", "Netflix", "Spotify", "Steam",
        "Costco", "HomeDepot", "Walgreens", "CVS", "Lyft",
        "DoorDash", "Instacart", "Apple", "Google", "Etsy",
    ]
    CATEGORIES = list(Category)
    GENDERS = list(Gender)

    def get_or_create_profile(customer_id):
        if customer_id not in request.app.state.customers:
            request.app.state.customers[customer_id] = {
                "dob": random_dob(),
                "gender": random.choice(GENDERS),
                "main_device": random.choice(DEVICES),
                "alt_device": random.choice(DEVICES),
                "merchants": random.sample(MERCHANTS, k=3),
                "categories": random.sample(CATEGORIES, k=3),
                "avg_amount": random.uniform(25, 35),
                "std": random.uniform(4, 7),
                "last_time": settings.SIMULATION_START + timedelta(hours=random.randint(1,24))
            }
        else:
            # Customer exists — fill in any missing behavioral fields
            # (DOB and gender are already set from DB seed or a prior call)
            p = request.app.state.customers[customer_id]
            if "main_device" not in p:
                p.update({
                    "main_device": random.choice(DEVICES),
                    "alt_device": random.choice(DEVICES),
                    "merchants": random.sample(MERCHANTS, k=3),
                    "categories": random.sample(CATEGORIES, k=3),
                    "avg_amount": random.uniform(50, 500),
                    "std": random.uniform(10, 80),
                    "last_time": settings.SIMULATION_START + timedelta(hours=random.randint(1,24))
                })
        return request.app.state.customers[customer_id]

    def random_dob() -> date:
        days_ago = random.randint(18 * 365, 70 * 365)
        return (datetime.now(timezone.utc) - timedelta(days=days_ago)).date()

    created = 0
    errors = 0
    num_customers = max(10, count // 10)

    for _ in range(count):
        customer_id = random.randint(1, num_customers)
        profile = get_or_create_profile(customer_id)
        is_anomaly = random.random() < 0.15

        if not is_anomaly:
            amount = max(1, random.gauss(profile["avg_amount"], profile["std"]))
            merchant = random.choice(profile["merchants"])
            category = random.choice(profile["categories"])
            device = profile["main_device"] if random.random() < 0.85 else profile["alt_device"]
            profile["last_time"] += timedelta(hours=random.randint(6, 48))
        else:
            anomaly_type = random.choice(["amount_spike", "new_merchant", "new_device", "burst"])

            if anomaly_type == "amount_spike":
                amount = profile["avg_amount"] * random.uniform(2, 3)
                merchant = random.choice(profile["merchants"])
                device = profile["main_device"]
                category = random.choice(profile["categories"])
            elif anomaly_type == "new_merchant":
                amount = max(1, random.gauss(profile["avg_amount"], profile["std"]))
                merchant = random.choice(MERCHANTS)
                device = profile["main_device"]
                category = random.choice(profile["categories"])
            elif anomaly_type == "new_device":
                amount = max(1, random.gauss(profile["avg_amount"], profile["std"]))
                merchant = random.choice(profile["merchants"])
                device = random.choice(DEVICES)
                category = random.choice(profile["categories"])
            elif anomaly_type == "burst":
                amount = max(1, random.gauss(profile["avg_amount"], profile["std"]))
                merchant = random.choice(profile["merchants"])
                device = profile["main_device"]
                category = random.choice(profile["categories"])
                profile["last_time"] += timedelta(minutes=random.randint(1, 10))

            profile["last_time"] += timedelta(hours=random.randint(1, 6))

        txn = TransactionInput(
            amount=round(amount, 2),
            time=profile["last_time"],
            category=category,
            device_name=device,
            merchant_name=merchant,
            customer_id=customer_id,
            customer_dob=profile["dob"],
            customer_gender=profile["gender"],
            model_key="log"
        )
        try:
            create_transaction(txn_data=txn, request=request, session=session)
            created += 1
        except HTTPException:
            errors += 1
            continue

    return {"created": created, "errors": errors, "total": count}    



    
    
