from fastapi import APIRouter, Depends, HTTPException, Query, Request
from datetime import datetime, timezone, timedelta
from core.deps import SessionDep, get_current_user
from sqlmodel import select
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError
from models import Transaction, TransactionInput, TransactionPublic, TransactionSummary, CustomerInput, DeviceInput, MerchantInput
from services.ml_pipeline import get_conf_score, get_risk_score
from services.transactions import upsert_customer,upsert_device,upsert_merchant
from utils.statistics import get_last_5_txn, get_recent_txn_count

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
        customer_id=t.customer.id,
        merchant_name=t.merchant.name,
        device_type=t.device.name,
        transaction_status=t.review.status
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

        last_5_txn = get_last_5_txn(customer_id=customer.id,session=session)

        #last 10 hours (10 steps)
        recent_txn_count = get_recent_txn_count(now=txn_data.time,customer_id=customer.id,session=session)
    

        txn_summary = TransactionSummary(last_5_txn=last_5_txn,
                                        avg_amount=customer.avg_amount,
                                        txn_count=customer.txn_count,
                                        recent_txn_count=recent_txn_count,
                                        merchant_freq=merchant.frequency)

        #infering to the models
        confidence_score = get_conf_score(app= request.app, txn_data= txn_data, txn_summary=txn_summary)
        risk_score = get_risk_score(z_scores=z_scores)
        
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
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=409, detail="Conflict, try again")
    except ValueError as e:
        session.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    
    
