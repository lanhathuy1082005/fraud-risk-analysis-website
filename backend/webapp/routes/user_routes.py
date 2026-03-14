from fastapi import APIRouter
from ..services.user_services import get_all_users_service, get_user_by_id_service, create_user_service, get_user_by_email_service

router = APIRouter(prefix="/users")

@router.get("/all")
def read_all_users():
    return get_all_users_service()

@router.get("/{user_id}")
def read_user(user_id: int):
    return get_user_by_id_service(user_id)

@router.get("/email/{email}")
def read_user_by_email(email: str):
    return get_user_by_email_service(email)

@router.post("/")
def create_new_user(user_data: dict):   
    return create_user_service(user_data)