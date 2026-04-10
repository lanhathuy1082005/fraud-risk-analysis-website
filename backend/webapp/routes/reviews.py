from fastapi import APIRouter, Depends, HTTPException
from core.deps import SessionDep, get_current_user,CurrentUser
from models import Review, Status
from sqlalchemy.exc import IntegrityError
from sqlmodel import select


router = APIRouter(prefix="/review", dependencies=[Depends(get_current_user)])


@router.post("/{review_id}")
def review_transaction(review_id: int, status: Status, session: SessionDep, user: CurrentUser):
    updated_rw = session.exec(select(Review).where(Review.id == review_id)).first()

    if not updated_rw:
        raise HTTPException(status_code=400, detail="Cannot review transaction")
    
    updated_rw.status, updated_rw.user_uuid = status, user.uuid
    try:
        session.add(updated_rw)
        session.commit()
        return {"msg": "Review created successfully"}
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=409,detail="Please try again")
