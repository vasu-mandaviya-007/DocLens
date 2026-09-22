from datetime import datetime, timezone
from typing import Optional, List
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field, EmailStr, BaseModel
import pymongo

class LinkedProvider(BaseModel):
    provider: str          # "google" | "github"
    provider_id: str        # us provider ka unique user ID

class User(Document): 
    username: str
    email: Indexed(EmailStr, unique=True)  # type: ignore
    password: Optional[str] = None 
    avatar: Optional[str] = None

    is_active: bool = True 
    is_verified: bool = False

    # auth_provider: str = "local"
    # auth_provider_id: Optional[str] = None

    linked_providers: List[LinkedProvider] = []

    # createdAt : datetime = Field(default_factory=datetime.now)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings: 
        name = "users"

    class Config:
        json_schema_extra = {
            "example": {
                "email": "vasu@example.com",
                "username": "Vasu Mandaviya",
            }
        }


class EmailVerificationToken(Document):
    user_id: PydanticObjectId
    otp_hash: str 
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "email_varification_tokes"
        indexes = [
            pymongo.IndexModel(
                [("expires_at", pymongo.ASCENDING)],
                expireAfterSeconds=0,
            )
        ]  


class PasswordResetOtp(Document):
    user_id: PydanticObjectId 
    otp_hash: str  # SHA-256 hash of the raw reset token, never store raw
    expires_at: datetime
    verified: bool = False
    used: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "password_reset_tokens"
        indexes = [
            pymongo.IndexModel(
                [("expires_at", pymongo.ASCENDING)],
                expireAfterSeconds=0,  # MongoDB TTL index -> auto-delete expired docs
            ),
        ]


class RefreshToken(Document):
    user_id: PydanticObjectId
    token_hash: str  # SHA-256 hash of the raw refresh token, never store raw
    expires_at: datetime
    revoked: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "refresh_tokens"
        indexes = [
            pymongo.IndexModel(
                [("expires_at", pymongo.ASCENDING)],
                expireAfterSeconds=0,  # MongoDB TTL index -> auto-delete expired docs
            ),
        ]


def user_to_public_dict(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "avatar": user["avatar"],
        "auth_provider": user.get("auth_provider", "local"),
    }
