
from pydantic import BaseModel


class UploadResponse(BaseModel):
    filename: str
    total_chunks: int 
    message: str


class RenameNotebookRequest(BaseModel):
    title: str


class SendMessage(BaseModel) :  
    text : str