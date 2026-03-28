from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from core.config import settings
from pwdlib import PasswordHash

    
password_hash = PasswordHash.recommended()

def create_access_token(data: dict):
    payload = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.TOKEN_EXPIRES_IN)
    payload.update({"exp": expire})
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

def verify_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        print(payload)
        return payload.get("sub")
    except JWTError:
        return None


def hash_password(password: str):
    return password_hash.hash(password)

def verify_password(password: str, hashed: str):
    return password_hash.verify(password, hashed)
