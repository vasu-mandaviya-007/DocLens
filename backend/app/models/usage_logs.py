from beanie import Document, PydanticObjectId
from enum import Enum
from datetime import datetime, timezone
from pydantic import Field
from typing import Optional
from pymongo import IndexModel, ASCENDING

def utc_now() -> datetime : 
    return datetime.now(timezone.utc) 

class ActionType(str, Enum) :  
    DOCUMENT_UPLOADED = "document_uploaded"
    QUESTION_ASKED = "question_asked"

class UsageLogs(Document) : 
    user_id : PydanticObjectId 
    action_type : ActionType
    document_id : Optional[PydanticObjectId] = None
    created_at : datetime = Field(default_factory=utc_now)

    class Settings : 
        name = "usage_logs"
        indexes = [
            IndexModel(
                [("user_id", ASCENDING), ("action_type", ASCENDING),("created_at", ASCENDING)]
            ),
            IndexModel([("created_at", ASCENDING)], expireAfterSeconds=2592000),
        ]


class UsageCounter(Document) :  
    user_id : PydanticObjectId
    date : datetime
    questions_count : int = 0 
    document_upload_count : int = 0
    created_at : datetime = Field(default_factory=utc_now)

    class Settings:
        name = "usage_counters"

        indexes = [
            IndexModel([("user_id", ASCENDING), ("date", ASCENDING)], unique=True),
            IndexModel([("created_at", ASCENDING)], expireAfterSeconds=259200),
        ]