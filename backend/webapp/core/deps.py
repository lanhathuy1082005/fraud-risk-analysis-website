from typing import Annotated
from sqlmodel import Session, select
from db import engine
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from models import User
from core.security import verify_token

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")
TokenDep = Annotated[str,Depends(oauth2_scheme)]

def get_current_user(token : TokenDep, session : SessionDep):
    uuid = verify_token(token)
    if not uuid:
        raise HTTPException(status_code=401,detail="Failed to verify token")
    user = session.exec(select(User).where(User.uuid == uuid)).first()
    if not user:
        raise HTTPException(status_code=401,detail="User not found")
    return user

CurrentUser = Annotated[str , Depends(get_current_user)]