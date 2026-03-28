from fastapi import APIRouter, HTTPException
from sqlmodel import select
from core.deps import SessionDep, CurrentUser
from models import User, UserPublic, UserRegister, UserLogin, Token
from pydantic import EmailStr
from core.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth")
def findEmail(email : EmailStr, session : SessionDep):
    return session.exec(select(User).where(User.email == email)).first()

@router.post("/register")
def register(user : UserRegister, session : SessionDep):
    existing = findEmail(user.email, session)
    if existing:
        raise HTTPException(status_code=400, detail="Account already existed")
    
    hashed = hash_password(user.password)
    new_user = User(email=user.email,name=user.name,password_hash=hashed)

    session.add(new_user)
    session.commit()
    return {"message" : "user_created"}

@router.post("/token")
def login(user : UserLogin, session : SessionDep):
    existing = findEmail(user.email, session)
    if not existing or not verify_password(user.password, existing.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")    

    access_token = create_access_token({"sub": str(existing.uuid)})
    return Token(access_token=access_token, token_type= "bearer")

@router.get("/me", response_model=UserPublic)
def get_current_user(current_user : CurrentUser):
    return current_user