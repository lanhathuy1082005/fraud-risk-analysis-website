from fastapi import APIRouter, Depends, HTTPException
from core.deps import SessionDep, get_current_user,CurrentUser
from models import Review, ReviewInput, Transaction
from sqlalchemy.exc import IntegrityError
from sqlmodel import select


router = APIRouter(prefix="/review", dependencies=[Depends(get_current_user)])


@router.post("/")
def review_transaction(session: SessionDep, user: CurrentUser, review_data: ReviewInput):
    new_rw = Review(status=review_data.status,
                    user_uuid=user.uuid)

    session.add(new_rw)
    session.flush()
    session.refresh(new_rw)

    updated_txn = session.exec(select(Transaction).where(Transaction.id == review_data.transaction_id)).first()

    if not updated_txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if updated_txn.review_id:
        raise HTTPException(status_code=400, detail="Transaction already reviewed")
    
    updated_txn.review_id = new_rw.id
    
    
    try:
        session.commit()
        return {"msg": "Review created successfully"}
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=409,detail="Please try again")
