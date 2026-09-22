from pydantic import BaseModel
from datetime import datetime


class PasswordReset(BaseModel):
    email : str
    otp : str
    expiresAt: datetime
    attempts : int = 0
    createdAt: datetime