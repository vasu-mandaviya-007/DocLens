
import asyncio
import logging
from datetime import datetime, timedelta, timezone
from app.core.config import settings
from beanie import PydanticObjectId
from fastapi import (
    APIRouter,
    BackgroundTasks,
    UploadFile,
    File,
    Depends,
    status,
    HTTPException,
)

from app.models.notebook_file import DocumentFile, FileStatus
from app.models.user import User
from app.models.notebook import Notebook
from app.dependencies.auth_deps import get_current_user
from app.core.exceptions import (
    NotFoundError,
    ConflictError,
    ValidationAppError,
)
from app.services.documents.cloudinary_service import (
    upload_file_to_cloudinary,
    delete_file_from_cloudinary,
)
from app.services.retrieval.vector_store import delete_chunks_for_notebook
from app.services.usage_service import (
    try_consume_document_quota,
    rollback_document_quota,
    log_document_uploaded,
)
from app.services.documents.document_extractor import (
    extract_pages,
    detect_file_type,
    InvalidDocumentError,
    SUPPORTED_FILE_LABEL,
)
from app.services.documents.processing_service import process_document

logger = logging.getLogger(__name__)

router = APIRouter()




async def check_and_mark_stale(document: DocumentFile) -> DocumentFile:
    if document.status != FileStatus.processing:
        return document

    elapsed = datetime.now(timezone.utc) - document.updated_at.replace(
        tzinfo=timezone.utc
    )
    if elapsed > timedelta(minutes=settings.PROCESSING_TIMEOUT_MINUTES):
        document.status = FileStatus.failed
        document.error_message = "Processing timed out. Please try uploading again."
        document.updated_at = datetime.now(timezone.utc)
        await document.save()
    return document


async def _finish_upload(
    document_id: str,
    notebook_id: str,
    user_id: PydanticObjectId,
    file_bytes: bytes,
    filename: str,
    file_type: str,
) -> None:
    
    document = await DocumentFile.get(PydanticObjectId(document_id))
    if not document:
        return

    upload_result = None

    async def _fail(message: str) -> None: 
        document.status = FileStatus.failed
        document.error_message = message
        document.updated_at = datetime.now(timezone.utc)
        await document.save()
        await rollback_document_quota(user_id)
        if upload_result:
            await delete_file_from_cloudinary(upload_result["public_id"])

    try:
        try:
            pages = await asyncio.to_thread(
                extract_pages, file_bytes, file_type, settings.MAX_PAGE_COUNT
            )
        except InvalidDocumentError as e:
            await _fail(str(e))
            return

        if not any(p["text"].strip() for p in pages):
            await _fail(
                "This file has no selectable text — it might be a scanned image. Try a text-based file."
            )
            return

        if len(pages) > settings.MAX_PAGE_COUNT:
            await _fail(f"This file has too many pages (max {settings.MAX_PAGE_COUNT}).")
            return

        upload_result = await upload_file_to_cloudinary(
            file_bytes, filename=filename, folder=f"DocLens/documents"
        )

        document.file_size = upload_result["bytes"]
        document.file_url = upload_result["url"]
        document.cloudinary_public_id = upload_result["public_id"]
        document.page_count = len(pages)
        document.updated_at = datetime.now(timezone.utc)
        await document.save()

    except Exception:
        logger.exception(
            "Upload finalization failed (unexpected) for document_id=%s", document_id
        )
        await _fail("Could not process this document. Please try again.")
        return

    await process_document(notebook_id, document_id, filename, pages)
    await log_document_uploaded(user_id, PydanticObjectId(document_id))




@router.post("/notebook/{notebook_id}/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(
    notebook_id: PydanticObjectId,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    
    notebook = await Notebook.get(notebook_id)
    if not notebook or notebook.user_id != current_user.id:
        raise NotFoundError("Notebook not found")

    existing_doc = await DocumentFile.find_one(DocumentFile.notebook_id == notebook_id)
    if existing_doc:
        if existing_doc.status == FileStatus.failed:
            if existing_doc.cloudinary_public_id:
                await delete_file_from_cloudinary(existing_doc.cloudinary_public_id)
            await asyncio.to_thread(delete_chunks_for_notebook, str(notebook_id))
            await existing_doc.delete()
        else:
            raise ConflictError("This notebook already has a document")

    file_type = detect_file_type(file.filename, file.content_type)

    if file_type is None:
        raise ValidationAppError(
            f"Unsupported file type. Please upload a {SUPPORTED_FILE_LABEL} file.",
            fields={"file": "unsupported_file_type"},
        )

    file_bytes = await file.read(settings.MAX_FILE_SIZE + 1)

    if len(file_bytes) > settings.MAX_FILE_SIZE:
        raise ValidationAppError(
            "File must be under 20MB", fields={"file": "file_too_large"}
        )

    await try_consume_document_quota(current_user.id)

    try:
        document = DocumentFile(
            notebook_id=notebook_id,
            owner_id=current_user.id,
            filename=file.filename,
            file_size=0,
            file_url="",
            cloudinary_public_id="",
            page_count=None,
            status=FileStatus.processing,
        )
        await document.insert()
        notebook.title = file.filename
        await notebook.save()
    except Exception as e:
        logger.exception(
            "Failed to create document record for notebook_id=%s", notebook_id
        )
        await rollback_document_quota(current_user.id)
        raise HTTPException(
            status_code=500, detail="Could not start upload. Please try again."
        ) from e

    background_tasks.add_task(
        _finish_upload,
        str(document.id),
        str(notebook.id),
        current_user.id,
        file_bytes,
        file.filename,
        file_type,
    )

    return {
        "data": {
            "document_id": str(document.id),
            "filename": document.filename,
            "status": document.status,
        }
    }


@router.get("/notebook/{notebook_id}/status")
async def get_notebook_status(
    notebook_id: PydanticObjectId, current_user: User = Depends(get_current_user) 
):
    notebook = await Notebook.get(notebook_id)
    if not notebook or notebook.user_id != current_user.id:
        raise HTTPException(
            status_code=404,
            detail={"code": "notebook_not_found", "message": "Notebook not found"},
        )

    document = await DocumentFile.find_one(DocumentFile.notebook_id == notebook_id)
    if not document:
        raise HTTPException(
            status_code=404,
            detail={"code": "document_not_found", "message": "Document not found"},
        )

    document = await check_and_mark_stale(document)

    return {
        "data": {
            "status": document.status,
            "page_count": document.page_count,
            "total_chunks": document.total_chunks,
            "document_url": document.file_url,
            "error_message": document.error_message,
            "summary": document.summary,
            "suggested_questions": document.suggested_questions,
        }
    }


