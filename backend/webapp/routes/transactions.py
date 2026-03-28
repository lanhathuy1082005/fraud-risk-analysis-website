from fastapi import APIRouter, Depends, HTTPException, Query
from core.deps import SessionDep, get_current_user
from services.fraud_detection import detect_fraud
from sqlmodel import select
from models import Transaction

router = APIRouter(prefix="/transactions", dependencies=[Depends(get_current_user)])

@router.get("/")
def get_transactions(  session: SessionDep , page : int = Query(default=1, le=1), limit : int = Query(default=10, le=100)):

    skip = ( page - 1 ) * limit
    t = session.exec(select(Transaction).order_by(Transaction.time.desc()).offset(skip).limit(limit)).all()

    if t is None:
        raise HTTPException(status_code=404, detail= "Transactions not found")

    return t

@router.post("/")
def create_transaction( session: SessionDep):
    new_transactions = Transaction()

    session.add
    
@router.patch("/")
def update_risk(session: SessionDep):
    pass
