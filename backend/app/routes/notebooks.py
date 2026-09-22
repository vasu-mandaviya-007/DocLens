from datetime import datetime, timezone 
import asyncio
from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, status
from fastapi.exceptions import HTTPException

from app.core.exceptions import NotFoundError
from app.dependencies.auth_deps import get_current_user


from app.models.conversation import Conversation
from app.models.message import Message
from app.models.notebook import Notebook
from app.models.notebook_file import DocumentFile
from app.schemas.auth import MessageResponse 
from app.models.User import User

from app.schemas.notebook import RenameNotebookRequest
from app.services.cloudinary_service import delete_file_from_cloudinary
from app.services.vector_store import delete_chunks_for_notebook

router = APIRouter() 


 
@router.get("/notebooks")
async def list_notebooks(current_user: User = Depends(get_current_user)):

    notebooks = (
        await Notebook.find(Notebook.user_id == current_user.id).sort(
            -Notebook.pinned_at, -Notebook.created_at
        )
        # .sort(-Notebook.created_at)
        .to_list()
    )

    result = []
    for nb in notebooks:
        # NOTE: ye ek query-per-notebook hai (N+1 pattern) — abhi ke scale
        # (ek user ki chand notebooks) ke liye theek hai, but agar kabhi
        # sainkड़on notebooks ho jayein, isko ek single aggregation query
        # mein batch karna better hoga.
        document = await DocumentFile.find_one(DocumentFile.notebook_id == nb.id)

        result.append(
            {
                "notebook_id": str(nb.id),
                "title": nb.title,
                "pinned": nb.pinned,
                "created_at": nb.created_at.isoformat(),
                "document": (
                    {
                        "filename": document.filename,
                        "document_url": document.file_url,
                        "status": document.status,
                        "page_count": document.page_count,
                    }
                    if document
                    else None
                ),
            }
        )

    return {"data": result}


@router.post("/notebook", status_code=status.HTTP_201_CREATED)
async def create_notebook(current_user: User = Depends(get_current_user)):

    notebook = Notebook(
        user_id=current_user.id,
        title="Untitled Notebook",
    )
    await notebook.insert()

    conversation = Conversation(notebook_id=notebook.id, owner_id=current_user.id)
    await conversation.insert()

    return {
        "data": {
            "notebook_id": str(notebook.id),
            "title": notebook.title,
            "conversation_id": str(conversation.id),
        }
    }



@router.get("/notebook/{notebook_id}")
async def get_notebook(
    notebook_id: PydanticObjectId, current_user: User = Depends(get_current_user)
):

    notebook = await Notebook.get(notebook_id)

    if not notebook or notebook.user_id != current_user.id:
        raise HTTPException(
            status_code=404,
            detail={"code": "notebook_not_found", "message": "Notebook not found"},
        )

    document = await DocumentFile.find_one(DocumentFile.notebook_id == notebook_id)

    return {
        "data": {
            "notebook_id": str(notebook.id),
            "title": notebook.title,
            "document": (
                {
                    "filename": document.filename,
                    "document_url": document.file_url,
                    "status": document.status,
                    "page_count": document.page_count,
                }
                if document
                else None
            ),
        }
    }


@router.patch("/notebook/{notebook_id}")
async def rename_notebook(
    notebook_id: PydanticObjectId,
    payload: RenameNotebookRequest,
    current_user: User = Depends(get_current_user),
):
    notebook = await Notebook.get(notebook_id)
    if not notebook or notebook.user_id != current_user.id:
        raise HTTPException(
            status_code=404,
            detail={"code": "notebook_not_found", "message": "Notebook not found"},
        )

    notebook.title = payload.title
    notebook.updated_at = datetime.now(timezone.utc)
    await notebook.save()

    return {"data": {"title": notebook.title}}


# @router.delete("/notebook/{notebook_id}")
# async def delete_notebook(
#     notebook_id: PydanticObjectId,
#     current_user: User = Depends(get_current_user),
# ):
#     notebook = await Notebook.get(notebook_id)
#     if not notebook or notebook.user_id != current_user.id: 
#         raise HTTPException(
#             status_code=404,
#             detail={"code": "notebook_not_found", "message": "Notebook not found"},
#         )

#     await DocumentFile.find(DocumentFile.notebook_id == notebook_id).delete()

#     await Message.find(Message.notebook_id == notebook_id).delete()

#     await Conversation.find(Conversation.notebook_id == notebook_id).delete()

#     await notebook.delete()

#     return MessageResponse(message="Notebook Deleted")



@router.delete("/notebook/{notebook_id}")
async def delete_notebook(notebook_id : PydanticObjectId, current_user = Depends(get_current_user)) : 

    notebook = await Notebook.get(notebook_id)

    if not notebook or notebook.user_id != current_user.id:
        raise NotFoundError("Notebook not found")

    document = await DocumentFile.find_one(DocumentFile.notebook_id == notebook_id) 

    if document and document.cloudinary_public_id : 
        await delete_file_from_cloudinary(document.cloudinary_public_id)

    await asyncio.to_thread(delete_chunks_for_notebook, str(notebook_id))

    await DocumentFile.find(DocumentFile.notebook_id == notebook_id).delete()
    await Message.find(Message.notebook_id == notebook_id).delete()
    await Conversation.find(Conversation.notebook_id == notebook_id).delete()

    await notebook.delete()

    return MessageResponse(message="Notebook Deleted")


@router.post("/pin-notebook/{notebook_id}")
async def pin_notebook(
    notebook_id: PydanticObjectId, current_user: User = Depends(get_current_user)
):

    notebook = await Notebook.get(notebook_id)

    if not notebook or notebook.user_id != current_user.id:
        raise NotFoundError(message="Notebook not found")

    if notebook.pinned:
        notebook.pinned = False
        notebook.pinned_at = None
    else:
        notebook.pinned = True
        notebook.pinned_at = datetime.now(timezone.utc)

    await notebook.save()

    return {
        "data": {
            "notebook_id": notebook.id,
            "pinned": notebook.pinned,
            "pinned_at": notebook.pinned_at,
        }
    }
