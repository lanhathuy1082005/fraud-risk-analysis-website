from fastapi import APIRouter
from core.deps import SessionDep,get_current_user,CurrentUser
from models import Review, ReviewInput
from sqlmodel import select


router = APIRouter(prefix="review",dependencies=get_current_user)


@router.post("/")
def review_transaction(session: SessionDep, user_id: CurrentUser, review_data: ReviewInput):
    new_rw = Review(status=review_data.status,
                    transaction_id=review_data.transaction_id,
                    user_id=user_id)
    session.add(new_rw)
    session.commit()
