from enum import Enum
from beanie import Document, Indexed, PydanticObjectId
from typing import Optional
from datetime import datetime,  timezone
from pydantic import Field



class FileStatus(str, Enum) : 
    processing = "processing"
    ready = "ready"
    failed = "failed"
  


class DocumentFile(Document) : 
    notebook_id : Indexed(PydanticObjectId) # type: ignore
    owner_id : PydanticObjectId
    filename : str
    file_size: int
    file_url: str                        # Cloudinary secure_url
    cloudinary_public_id: str
    page_count : Optional[int] = None
    status : FileStatus = FileStatus.processing
    total_chunks: int = 0
    error_message: Optional[str] = None
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "notebook_files"
        indexes = ["owner_id"]
