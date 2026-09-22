# import cloudinary.uploader
# from fastapi import UploadFile, HTTPException, status
# import asyncio
# from app.core.exceptions import AppException, ServiceUnavailableError

# async def upload_file_to_cloudinary(file: UploadFile, folder: str = "documents") -> dict:

#     try :
#         file_bytes = await file.read()

#         result = await asyncio.to_thread(
#             cloudinary.uploader.upload,
#             file_bytes,
#             resource_type="raw",
#             folder=folder,
#             use_filename=True,
#             unique_filename=True,
#             overwrite=False,
#         )

#         return {
#             "url": result["secure_url"],
#             "public_id": result["public_id"],
#             "bytes": result["bytes"],
#         }

#     except Exception as e:
#         raise ServiceUnavailableError(
#             "Failed to upload file. Please try again.",
#             fields={"file": "upload_failed"},
#         ) from e


# async def delete_file_from_cloudinary(public_id: str) -> bool:
#     try :
#         result = await asyncio.to_thread(
#             cloudinary.uploader.destroy,
#             public_id,
#             resource_type="raw",
#         )
#         return result.get("result") == "ok"
#     except Exception as e:
#         print(f"Cloudinary delete failed for {public_id}: {e}")
#         return False


import asyncio
import logging

import cloudinary.uploader

from app.core.exceptions import ServiceUnavailableError

logger = logging.getLogger(__name__)


async def upload_file_to_cloudinary(
    file_bytes: bytes, filename: str, folder: str = "documents"
) -> dict:
    """Takes raw bytes instead of UploadFile so the caller controls I/O
    (read once, in the route) and this function stays trivially unit-testable
    without mocking FastAPI's UploadFile."""
    try:
        result = await asyncio.to_thread(
            cloudinary.uploader.upload,
            file_bytes,
            resource_type="raw",
            folder=folder,
            use_filename=True,
            unique_filename=True,
            overwrite=False,
        )

        return {
            "url": result["secure_url"],
            "public_id": result["public_id"],
            "bytes": result["bytes"],
        }

    except Exception as e:
        logger.exception(
            "Cloudinary upload failed for filename=%s folder=%s", filename, folder
        )
        raise ServiceUnavailableError(
            "Failed to upload file. Please try again.",
            fields={"file": "upload_failed"},
        ) from e


async def delete_file_from_cloudinary(public_id: str) -> bool:
    try:
        result = await asyncio.to_thread(
            cloudinary.uploader.destroy,
            public_id,
            resource_type="raw",
        )
        return result.get("result") == "ok"
    except Exception:
        logger.exception("Cloudinary delete failed for public_id=%s", public_id)
        return False
