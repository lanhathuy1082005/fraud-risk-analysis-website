from ..repositories.user_repository import get_all_users, get_user_by_email, get_user_by_id, create_user

def get_all_users_service():
    return get_all_users()

def get_user_by_id_service(user_id):
    return get_user_by_id(user_id)

def create_user_service(user_data):
    return create_user(user_data)

def get_user_by_email_service(email):
    return get_user_by_email(email)