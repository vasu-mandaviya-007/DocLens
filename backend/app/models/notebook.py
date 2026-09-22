from datetime import datetime, timezone
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field
from typing import Optional

def get_now() -> datetime : 
    return datetime.now(timezone.utc)  

class Notebook(Document) : 
    user_id : Indexed(PydanticObjectId) # type: ignore
    title : str
    pinned : bool = False   
    pinned_at : Optional[datetime] = None 
    created_at : datetime = Field(default_factory=get_now)
    updated_at : datetime = Field(default_factory=get_now)

    class Settings : 
        name = "notebooks"  

    class Config: 
        json_schema_extra = { 
            "example": {
                "title": "Employment_Contract.pdf", 
            }
        }


