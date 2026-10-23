
from datetime import datetime, timezone
from typing import List, Optional

import pymongo
from beanie import Document, Indexed, PydanticObjectId
from pydantic import BaseModel, EmailStr, Field


class LinkedProvider(BaseModel):
    provider: str  # "google" | "github"
    provider_id: str


class User(Document):
    username: str
    email: Indexed(EmailStr, unique=True)  # type: ignore
    password: Optional[str] = None
    avatar: Optional[str] = None

    is_active: bool = True
    is_verified: bool = False

    linked_providers: List[LinkedProvider] = []

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
    attempts: int = 0 
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
    otp_hash: str 
    expires_at: datetime
    verified: bool = False
    used: bool = False
    attempts: int = 0
    reset_token_hash: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "password_reset_tokens"
        indexes = [
            pymongo.IndexModel(
                [("expires_at", pymongo.ASCENDING)],
                expireAfterSeconds=0,
            ),
        ]


class RefreshToken(Document):
    user_id: PydanticObjectId
    token_hash: str 
    expires_at: datetime
    revoked: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "refresh_tokens"
        indexes = [
            pymongo.IndexModel(
                [("expires_at", pymongo.ASCENDING)],
                expireAfterSeconds=0,
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








