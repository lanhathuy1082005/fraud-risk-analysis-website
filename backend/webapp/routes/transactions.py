from fastapi import APIRouter, Depends, HTTPException, Query
from core.deps import SessionDep, get_current_user
from services.transactions import input_transaction
from sqlmodel import select
from sqlalchemy.exc import IntegrityError
from models import Transaction, TransactionInput

router = APIRouter(prefix="/transactions", dependencies=[Depends(get_current_user)])

@router.get("/")
def get_transactions(  session: SessionDep , page : int = Query(default=1, ge=1), limit : int = Query(default=10, ge=1, le=100)):

    skip = ( page - 1 ) * limit
    t = session.exec(select(Transaction).order_by(Transaction.time.desc()).offset(skip).limit(limit)).all()

    if t is None:
        raise HTTPException(status_code=404, detail= "Transactions not found")

    return t

@router.post("/")
def create_transaction( data: TransactionInput, session: SessionDep):
    try:
        t = input_transaction(data, session)
        session.add(t)
        session.commit()
        return {"msg":"transaction_created"}
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=409, detail="Conflict, try again")

    
    

@router.patch("/")
def update_risk_and_confidence(session: SessionDep):
    pass
