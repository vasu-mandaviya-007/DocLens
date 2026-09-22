from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from app.core.config import settings
import bcrypt
import secrets 
import hashlib



def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8") 


def verify_password(password: str, hashed_password: str) -> str:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(user_id: str) -> str:   
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES) 
    payload = {"sub": user_id, "type": "access", "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM) 


def create_refresh_token(user_id: str) -> tuple[str, datetime]: 
    """Returns (token_string, expiry_datetime) — expiry DB mein bhi save karni hoti hai."""
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": user_id, "type": "refresh", "exp": expire}
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token, expire

def generate_refresh_token_data():
    raw_token = secrets.token_urlsafe(32) # Secure random string
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return raw_token, token_hash, expires_at


def decode_access_token(token: str) -> dict: 
    """
    Raises JWTError if the token is invalid, expired, or tampered with.
    Caller is responsible for catching JWTError and returning a 401.
    """
    payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    if payload.get("type") != "access":
        raise JWTError("Invalid token type")
    return payload



def generate_refresh_token() -> str:
    return secrets.token_urlsafe(64)
 
 
def hash_refresh_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest() 
 
 
def refresh_token_expiry() -> datetime: 
    return datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)  

 


def generate_otp(length : int = 6) -> str : 
    return "".join(secrets.choice("0123456789") for _ in range(length))  


def hash_otp(row_otp : str) -> str : 
    return hashlib.sha256(row_otp.encode("utf-8")).hexdigest()


def otp_expiry() -> datetime : 
    return datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES) 