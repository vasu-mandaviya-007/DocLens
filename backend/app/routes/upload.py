import shutil
import os
from fastapi import APIRouter, UploadFile, File

from app.services.pdf_service import read_pdf
from app.services.chunk_service import chunk_text
from app.schemas.notebook import UploadResponse 

router = APIRouter()

UPLOAD_DIR = "data"


@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = read_pdf(file_path) 
    chunks = chunk_text(text)

    return UploadResponse(
        filename=str(file.filename),
        total_chunks=len(chunks),
        message="Document Processed Successfully"
    )
