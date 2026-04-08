from fastapi import APIRouter, Depends, HTTPException, Query, Request
from datetime import date, datetime, timezone, timedelta
from core.deps import SessionDep, get_current_user
from core.config import settings
from sqlmodel import select
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError
from models import Transaction, TransactionInput, TransactionPublic, TransactionSummary, CustomerInput, DeviceInput, MerchantInput, Category, Gender
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
        .order_by(Transaction.time.desc())
        .offset(skip).limit(limit)).all()
    
    result = [
    TransactionPublic(
        amount=t.amount, time=t.time, category=t.category,
        id=t.id, uuid=t.uuid, customer_id=t.customer.id, 
        merchant_name=t.merchant.name, device_type=t.device.name,
        transaction_status=t.review.status if t.review else None,
        risk_score=t.risk_score, confidence_score=t.confidence_score
    )
    for t in transactions]

    return result

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
    

        txn_summary = TransactionSummary(last_5_txn=last_5_txn,
                                        avg_amount=customer.avg_amount,
                                        txn_count=customer.txn_count,
                                        recent_txn_count=recent_txn_count,
                                        merchant_freq=merchant.frequency)

        #infering to the models
        risk_score = get_risk_score(app= request.app, txn_data= txn_data, txn_summary=txn_summary)
        confidence_score = get_conf_score(z_scores=z_scores,
                                    txn_data=txn_data,
                                    customer=customer,
                                    c_d_data=c_d_data,
                                    c_c_data=c_c_data)
        
        new_transaction = Transaction(amount=txn_data.amount,
                                    time=txn_data.time,
                                    category=txn_data.category,
                                    merchant_id=merchant.id,
                                    customer_id=customer.id,
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
    
@router.get("/mock")
def mock_transactions(request: Request, session: SessionDep, count: int = Query(default=200, ge=1, le=5000)):
    DEVICES = ["Phone", "Tablet", "Desktop", "Unknown"]
    MERCHANTS = [
        "Amazon", "Walmart", "Target", "BestBuy", "Starbucks",
        "McDonalds", "Uber", "Netflix", "Spotify", "Steam"
    ]
    # Replace with your actual Category enum values from models.py
    CATEGORIES = list(Category)
    GENDERS = list(Gender)
    MODELS = ["log","gb"]

    def random_dob() -> date:
        # Age range: 18–70 years old
        days_ago = random.randint(18 * 365, 70 * 365)
        return (datetime.now(timezone.utc) - timedelta(days=days_ago)).date()

    def random_time() -> datetime:
        # Transactions spread across the last 90 days
        seconds_ago = random.randint(0, 90 * 24 * 3600)
        return datetime.now(timezone.utc) - timedelta(seconds=seconds_ago)

    created = 0
    errors = 0

    for _ in range(count):
        txn = TransactionInput(
            amount=round(random.uniform(100, 10000), 2),
            time=random_time(),
            category=random.choice(CATEGORIES),
            device_name=random.choice(DEVICES),
            merchant_name=random.choice(MERCHANTS),
            customer_id=random.randint(1, 10),
            customer_dob=random_dob(),
            customer_gender=random.choice(GENDERS),
            model_key=random.choice(MODELS)
        )
        try:
            create_transaction(txn_data=txn, request=request, session=session)
            created += 1
        except HTTPException:
            errors += 1
            continue

    return {"created": created, "errors": errors, "total": count}
        



    
    
