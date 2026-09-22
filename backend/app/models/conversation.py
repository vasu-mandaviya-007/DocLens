from beanie import Document, PydanticObjectId
from pydantic import Field
from datetime import datetime, timezone

 
class Conversation(Document):
    notebook_id: PydanticObjectId
    owner_id: PydanticObjectId
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "conversations"
        indexes = ["notebook_id", "owner_id"]



