from fastapi import APIRouter, Depends, HTTPException
from core.deps import SessionDep, get_current_user,CurrentUser
from models import ReviewInput, Review
from sqlalchemy.exc import IntegrityError
from sqlmodel import select


router = APIRouter(prefix="/review", dependencies=[Depends(get_current_user)])


@router.post("/{transaction_id}")
def review_transaction_by_txn(transaction_id: int, rw_data: ReviewInput, session: SessionDep, user: CurrentUser):
    from models import Transaction
    
    txn = session.exec(select(Transaction).where(Transaction.id == transaction_id)).first()
    
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if txn.review_id:
        existing = session.exec(select(Review).where(Review.id == txn.review_id)).first()
        if existing and existing.status is not None:
            raise HTTPException(status_code=400, detail="Transaction has already been reviewed")
        review = existing
    else:
        review = Review(status=rw_data.status,user_uuid=user.uuid)
        session.add(review)
        session.flush()
        session.refresh(review)
        txn.review_id = review.id
        session.add(txn)
    
    try:
        session.commit()
        return {"msg": "Review created successfully"}
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=409, detail="Please try again")
