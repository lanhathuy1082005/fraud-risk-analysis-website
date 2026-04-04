from fastapi import APIRouter, Depends
from core.deps import SessionDep, get_current_user,CurrentUser
from models import Review, ReviewInput
from sqlmodel import select


router = APIRouter(prefix="/review", dependencies=[Depends(get_current_user)])


@router.post("/")
def review_transaction(session: SessionDep, user: CurrentUser, review_data: ReviewInput):
    new_rw = Review(status=review_data.status,
                    user_id=user.uuid)
    session.add(new_rw)
    session.commit()
