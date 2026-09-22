from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from beanie import Document, Indexed, PydanticObjectId
from pydantic import BaseModel, Field
 
 
class MessageRole(str, Enum):
    user = "user"
    assistant = "assistant" 
 
 
class Citation(BaseModel): 
    page: int
    snippet: str 


class Message(Document):
    notebook_id : Indexed(PydanticObjectId) # type: ignore
    role : MessageRole
    text : str
    citations : Optional[List[Citation]] = None

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
 
    class Settings:
        name = "messages"
