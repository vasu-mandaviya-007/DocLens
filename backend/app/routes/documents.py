# from app.models.notebook_file import DocumentFile, FileStatus
# from app.models.User import User
# from app.models.notebook import Notebook
# from app.dependencies.auth_deps import get_current_user
# from datetime import datetime, timedelta, timezone
# from beanie import PydanticObjectId
# from fastapi import APIRouter, BackgroundTasks, UploadFile, File, Depends, status, HTTPException
# from app.core.exceptions import NotFoundError, ConflictError, AppException, ValidationAppError
# from app.services.cloudinary_service import upload_file_to_cloudinary, delete_file_from_cloudinary
# from app.services.vector_store import delete_chunks_for_notebook
# from app.core.db import get_client
# from app.routes.quota import try_consume_document_quota, rollback_document_quota, log_document_uploaded
# from app.services.pdf_service import InvalidPdfError, extract_pages_from_pdf_bytes
# from app.services.document_extractor import extract_pages, detect_file_type, InvalidDocumentError, SUPPORTED_FILE_LABEL
# from app.services.processing_service import process_document
# import logging

# logger = logging.getLogger(__name__)

# router = APIRouter()


# MAX_FILE_SIZE = 20 * 1024 * 1024
# PROCESSING_TIMEOUT_MINUTES = 1


# async def check_and_mark_stale(document: DocumentFile):

#     if document.status != FileStatus.processing:
#         return document

#     elapsed = datetime.now(timezone.utc) - document.updated_at.replace(
#         tzinfo=timezone.utc
#     )
#     if elapsed > timedelta(minutes=PROCESSING_TIMEOUT_MINUTES):
#         document.status = FileStatus.failed
#         document.error_message = "Processing timed out. Please try uploading again."
#         document.updated_at = datetime.now(timezone.utc)
#         await document.save()
#     return document


# @router.post("/notebook/{notebook_id}/upload", status_code=status.HTTP_201_CREATED)
# async def upload_document(
#     notebook_id: PydanticObjectId,
#     background_tasks: BackgroundTasks,
#     file: UploadFile = File(...),
#     current_user: User = Depends(get_current_user),
# ):

#     notebook = await Notebook.get(notebook_id)


#     if not notebook or notebook.user_id != current_user.id:
#         raise NotFoundError("Notebook not found")


#     # existing_doc_count = await DocumentFile.find_one(DocumentFile.notebook_id == notebook_id).count()

#     # if existing_doc_count >= 1:
#     #     raise ConflictError("This notebook already has a document")

#     existing_doc = await DocumentFile.find_one(DocumentFile.notebook_id == notebook_id)

#     if existing_doc:
#         if existing_doc.status == FileStatus.failed:
#             # Purana FAILED document safely cleanup karo, taaki retry ho sake
#             if existing_doc.cloudinary_public_id:
#                 await delete_file_from_cloudinary(existing_doc.cloudinary_public_id)
#             await delete_chunks_for_notebook(str(notebook_id))
#             await existing_doc.delete()
#         else:
#             # "processing" ya "ready" hai — genuinely already ek document hai
#             raise ConflictError("This notebook already has a document")


#     # if file.content_type != "application/pdf":
#     #     # raise HTTPException(
#     #     #     status_code=400,
#     #     #     detail={
#     #     #         "code": "invalid_file_type",
#     #     #         "message": "Only PDF files are allowed",
#     #     #     },
#     #     # )
#     #     raise ValidationAppError("Only PDF files are allowed", fields={"file": "invalid_file_type"})

#     file_type = detect_file_type(file.filename, file.content_type)
#     if file_type is None :
#         raise ValidationAppError(
#             f"Unsupported file type. Please upload a {SUPPORTED_FILE_LABEL} file.",
#             fields={"file": "unsupported_file_type"},
#         )


#     file_bytes = await file.read()

#     if len(file_bytes) > MAX_FILE_SIZE:
#         raise ValidationAppError("File must be under 20MB", fields={"file": "file_too_large"})

#     await try_consume_document_quota(current_user.id)

#     try:

#         # try:

#         #     pages = extract_pages_from_pdf_bytes(file_bytes)

#         # except InvalidPdfError as e:
#         #     # raise HTTPException(
#         #     #     status_code=400, detail={"code": "invalid_pdf", "message": str(e)}
#         #     # )
#         #     raise ValidationAppError(str(e), fields={"file": "invalid_pdf"})

#         try:
#             pages = extract_pages(file_bytes, file_type)
#         except InvalidDocumentError as e:
#             raise ValidationAppError(str(e), fields={"file": "invalid_document"})

#         if not any(p["text"].strip() for p in pages):
#             # raise HTTPException(
#             #     status_code=400,
#             #     detail={
#             #         "code": "no_extractable_text",
#             #         "message": "This PDF has no selectable text — it might be a scanned image. Try a text-based PDF.",
#             #     },
#             # )
#             raise ValidationAppError(
#                 "This PDF has no selectable text — it might be a scanned image. Try a text-based PDF.",
#                 fields={"file": "no_extractable_text"},
#             )

#         await file.seek(0)

#         upload_result = await upload_file_to_cloudinary(
#             file, folder=f"notebooks/{notebook.id}"
#         )

#         document = DocumentFile(
#             notebook_id=notebook_id,
#             owner_id=current_user.id,
#             filename=file.filename,
#             file_size=upload_result["bytes"],
#             file_url=upload_result["url"],
#             cloudinary_public_id=upload_result["public_id"],
#             page_count=len(pages),
#         )

#         client = get_client()

#         async with await client.start_session() as session :

#             async with session.start_transaction() :

#                 await document.insert(session=session)

#                 notebook.title = file.filename
#                 await notebook.save(session=session)

#                 # await UsageLogs(
#                 #     user_id=current_user.id,
#                 #     action_type=ActionType.DOCUMENT_UPLOADED,
#                 #     document_id=document.id,
#                 #     notebook_id=notebook_id,
#                 # ).insert(session=session)

#     # except AppException as e:
#     #     print(e)
#     #     await rollback_document_quota(current_user.id)
#     #     raise

#     # except Exception as e:
#     #     print(e)
#     #     await rollback_document_quota(current_user.id)
#     #     raise AppException("Could not upload document. Please try again.")

#     except AppException as e:
#         logger.exception("Upload failed (AppException)")
#         await rollback_document_quota(current_user.id)
#         raise

#     except Exception as e:
#         logger.exception("Upload failed (unexpected)")
#         await rollback_document_quota(current_user.id)
#         raise AppException("Could not upload document. Please try again.")

#     background_tasks.add_task(
#         process_document, str(notebook.id), str(document.id), file.filename, pages
#     )

#     background_tasks.add_task(
#         log_document_uploaded, current_user.id, document.id
#     )

#     return {
#         "data": {
#             "document_id": str(document.id),
#             "filename": document.filename,
#             "status": document.status,
#         }
#     }


# @router.get("/notebook/{notebook_id}/status")
# async def get_notebook_status(
#     notebook_id: PydanticObjectId, current_user: User = Depends(get_current_user)
# ):
#     notebook = await Notebook.get(notebook_id)
#     if not notebook or notebook.user_id != current_user.id:
#         raise HTTPException(
#             status_code=404,
#             detail={"code": "notebook_not_found", "message": "Notebook not found"},
#         )

#     document = await DocumentFile.find_one(DocumentFile.notebook_id == notebook_id)

#     if not document:
#         raise HTTPException(
#             status_code=404,
#             detail={"code": "document_not_found", "message": "Document not found"},
#         )

#     document = await check_and_mark_stale(document)

#     return {
#         "data": {
#             "status": document.status,
#             "page_count": document.page_count,
#             "total_chunks": document.total_chunks,
#             "error_message": document.error_message,
#         }
#     }


import asyncio
import logging
from datetime import datetime, timedelta, timezone

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
from app.models.User import User
from app.models.notebook import Notebook
from app.dependencies.auth_deps import get_current_user
from app.core.exceptions import (
    NotFoundError,
    ConflictError,
    AppException,
    ValidationAppError,
)
from app.services.cloudinary_service import (
    upload_file_to_cloudinary,
    delete_file_from_cloudinary,
)
from app.services.vector_store import delete_chunks_for_notebook
from app.core.db import get_client
from app.routes.quota import (
    try_consume_document_quota,
    rollback_document_quota,
    log_document_uploaded,
)
from app.services.document_extractor import (
    extract_pages,
    detect_file_type,
    InvalidDocumentError,
    SUPPORTED_FILE_LABEL,
)
from app.services.processing_service import process_document

logger = logging.getLogger(__name__)

router = APIRouter()

# TODO: move to app settings/config once a central config module exists.
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB
MAX_PAGE_COUNT = 500  # hard cap to bound extraction time/memory
PROCESSING_TIMEOUT_MINUTES = (
    8  # realistic ceiling for embedding pipeline; tune against measured p99
)


async def check_and_mark_stale(document: DocumentFile) -> DocumentFile:
    if document.status != FileStatus.processing:
        return document

    elapsed = datetime.now(timezone.utc) - document.updated_at.replace(
        tzinfo=timezone.utc
    )
    if elapsed > timedelta(minutes=PROCESSING_TIMEOUT_MINUTES):
        document.status = FileStatus.failed
        document.error_message = "Processing timed out. Please try uploading again."
        document.updated_at = datetime.now(timezone.utc)
        await document.save()
    return document


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

    # Application-level guard. The real invariant is enforced by a unique
    # index on DocumentFile.notebook_id (see db_indexes.py) so concurrent
    # uploads to the same notebook can't both slip past this check.
    existing_doc = await DocumentFile.find_one(DocumentFile.notebook_id == notebook_id)
    if existing_doc:
        if existing_doc.status == FileStatus.failed:
            # Previous attempt failed — clean it up so the user can retry.
            if existing_doc.cloudinary_public_id:
                await delete_file_from_cloudinary(existing_doc.cloudinary_public_id)
            await delete_chunks_for_notebook(str(notebook_id))
            await existing_doc.delete()
        else:
            # "processing" or "ready" — a document genuinely already exists.
            raise ConflictError("This notebook already has a document")

    file_type = detect_file_type(file.filename, file.content_type)
    if file_type is None:
        raise ValidationAppError(
            f"Unsupported file type. Please upload a {SUPPORTED_FILE_LABEL} file.",
            fields={"file": "unsupported_file_type"},
        )

    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise ValidationAppError(
            "File must be under 20MB", fields={"file": "file_too_large"}
        )

    await try_consume_document_quota(current_user.id)

    # Tracks whether a Cloudinary upload happened in this request, so we can
    # clean it up if anything downstream fails before the DB commit.
    upload_result = None

    try:
        try:
            # CPU-bound (pdfplumber / python-docx / decode) — must not block
            # the event loop, otherwise one large file stalls every other
            # concurrent request on this worker.
            pages = await asyncio.to_thread(extract_pages, file_bytes, file_type)
        except InvalidDocumentError as e:
            raise ValidationAppError(str(e), fields={"file": "invalid_document"})

        if not any(p["text"].strip() for p in pages):
            raise ValidationAppError(
                "This file has no selectable text — it might be a scanned image. Try a text-based file.",
                fields={"file": "no_extractable_text"},
            )

        if len(pages) > MAX_PAGE_COUNT:
            raise ValidationAppError(
                f"This file has too many pages (max {MAX_PAGE_COUNT}).",
                fields={"file": "too_many_pages"},
            )

        upload_result = await upload_file_to_cloudinary(
            file_bytes, filename=file.filename, folder=f"notebooks/{notebook.id}"
        )

        document = DocumentFile(
            notebook_id=notebook_id,
            owner_id=current_user.id,
            filename=file.filename,
            file_size=upload_result["bytes"],
            file_url=upload_result["url"],
            cloudinary_public_id=upload_result["public_id"],
            page_count=len(pages),
        )

        client = get_client()

        async with await client.start_session() as session:
            async with session.start_transaction():
                await document.insert(session=session)
                notebook.title = file.filename
                await notebook.save(session=session)

    except AppException:
        logger.exception("Upload failed (AppException) for notebook_id=%s", notebook_id)
        await rollback_document_quota(current_user.id)
        if upload_result:
            await delete_file_from_cloudinary(upload_result["public_id"])
        raise

    except Exception as e:
        logger.exception("Upload failed (unexpected) for notebook_id=%s", notebook_id)
        await rollback_document_quota(current_user.id)
        if upload_result:
            await delete_file_from_cloudinary(upload_result["public_id"])
        raise AppException("Could not upload document. Please try again.") from e

    background_tasks.add_task(
        process_document, str(notebook.id), str(document.id), file.filename, pages
    )
    background_tasks.add_task(log_document_uploaded, current_user.id, document.id)

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
            "error_message": document.error_message,
        }
    }
