import json
import time
import asyncio
from datetime import datetime, timedelta, timezone
from app.routes.quota import try_consume_notebook_quota

from beanie import PydanticObjectId
from fastapi import APIRouter, BackgroundTasks, Depends, File, UploadFile, status
from fastapi.exceptions import HTTPException
from fastapi.responses import StreamingResponse

from app.core.exceptions import NotFoundError
from app.core.gemini_client import gemini_client
from app.dependencies.auth_deps import get_current_user
from app.core.db import get_client


from app.models.conversation import Conversation
from app.models.message import Citation, Message, MessageRole
from app.models.notebook import Notebook
from app.models.notebook_file import DocumentFile, FileStatus
from app.schemas.auth import MessageResponse
from app.models.User import User
from app.models.usage_logs import UsageCounter

from app.schemas.notebook import RenameNotebookRequest, SendMessage
from app.services.chat_service import stream_answer
from app.services.cloudinary_service import upload_pdf_to_cloudinary
from app.services.pdf_service import extract_pages_from_pdf_bytes
from app.services.processing_service import process_document
from app.utils.pdf_utils import InvalidPdfError, get_pdf_page_count

router = APIRouter()

MAX_FILE_SIZE = 20 * 1024 * 1024
PROCESSING_TIMEOUT_MINUTES = 1


@router.get("/notebooks")
async def list_notebooks(current_user: User = Depends(get_current_user)):

    notebooks = (
        await Notebook.find(Notebook.user_id == current_user.id) 
        .sort(-Notebook.pinned_at) 
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
 
        result.append({
            "notebook_id": str(nb.id),
            "title": nb.title,
            "pinned" : nb.pinned,
            "created_at": nb.created_at.isoformat(),
            "document": (
                {
                    "filename": document.filename,
                    "document_url" : document.file_url,
                    "status": document.status,
                    "page_count": document.page_count,
                }
                if document
                else None
            ),
        })
 
    return {"data": result}



@router.post("/notebook", status_code=status.HTTP_201_CREATED)  
async def create_notebook(current_user : User = Depends(get_current_user)) :

    client = get_client()

    # async with await client.start_session() as session : 

    #     try : 

    #         async with session.start_transaction() : 
            
    await try_consume_notebook_quota(current_user.id)   

    notebook = Notebook(  
        user_id=current_user.id,
        title="Untitled Notebook",
    )
    await notebook.insert()

    conversation = Conversation(
        notebook_id=notebook.id,
        owner_id=current_user.id
    )

    await conversation.insert()

    # await asyncio.sleep(2)


        # except Exception as e:
        #     raise HTTPException(status_code=500, detail="Could not create notebook. Please try again.")


    return {
        "data": {
            "notebook_id": str(notebook.id), 
            "title": notebook.title,
            "conversation_id": str(conversation.id),
        }
    }



@router.post("/notebook/{notebook_id}/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(
    notebook_id : PydanticObjectId, 
    background_tasks : BackgroundTasks,
    file : UploadFile = File(...),
    current_user : User = Depends(get_current_user)
) : 
    notebook = await Notebook.get(notebook_id)
    if not notebook or notebook.user_id != current_user.id : 
        raise NotFoundError("Notebook not found")


    existing_doc = await DocumentFile.find_one(DocumentFile.notebook_id==notebook_id)
    if existing_doc:
        raise HTTPException(
            status_code=409, 
            detail={"code": "document_already_exists", "message": "This notebook already has a document"},
        )

    if file.content_type != "application/pdf":  
        raise HTTPException(status_code=400, detail={"code": "invalid_file_type", "message": "Only PDF files are allowed"})


    file_bytes = await file.read() 
    if len(file_bytes) > MAX_FILE_SIZE : 
        raise HTTPException(status_code=400, detail={"code": "file_too_large", "message": "File must be under 20MB"})


    # NAYA: page count nikalo, isi memory mein maujood bytes se
    try:
        pages = extract_pages_from_pdf_bytes(file_bytes)  
    except InvalidPdfError as e:
        raise HTTPException(status_code=400, detail={"code": "invalid_pdf", "message": str(e)})

    if not any(p["text"].strip() for p in pages) : 
        raise HTTPException(
            status_code=400,
            detail={
                "code": "no_extractable_text",
                "message": "This PDF has no selectable text — it might be a scanned image. Try a text-based PDF.",
            },
        )

    await file.seek(0)

    upload_result = await upload_pdf_to_cloudinary(file, folder=f"notebooks/{notebook.id}")


    document = DocumentFile(
        notebook_id=notebook_id, 
        owner_id=current_user.id,  
        filename=file.filename,
        file_size=upload_result["bytes"],
        file_url=upload_result["url"],
        cloudinary_public_id=upload_result["public_id"], 
        page_count=len(pages)
    )
    await document.insert() 

    notebook.title = file.filename
    await notebook.save()

    background_tasks.add_task(
        process_document,
        str(notebook.id),
        str(document.id), 
        file.filename,
        pages
    )

    return { 
        "data": {
            "document_id": str(document.id),
            "filename": document.filename,
            "status": document.status,
        }
    }

 

@router.get("/notebook/{notebook_id}") 
async def get_notebook( notebook_id: PydanticObjectId, current_user: User = Depends(get_current_user)):

    notebook = await Notebook.get(notebook_id)

    if not notebook or notebook.user_id != current_user.id :  
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
async def rename_notebook(notebook_id: PydanticObjectId,payload: RenameNotebookRequest,current_user: User = Depends(get_current_user)):
    notebook = await Notebook.get(notebook_id)
    if not notebook or notebook.user_id != current_user.id:
        raise HTTPException(status_code=404, detail={"code": "notebook_not_found", "message": "Notebook not found"})

    notebook.title = payload.title
    notebook.updated_at = datetime.now(timezone.utc) 
    await notebook.save()

    return {"data": {"title": notebook.title}}


@router.delete("/notebook/{notebook_id}")
async def delete_notebook(notebook_id: PydanticObjectId, current_user: User = Depends(get_current_user),):
    notebook = await Notebook.get(notebook_id)
    if not notebook or notebook.user_id != current_user.id:
        raise HTTPException(status_code=404, detail={"code": "notebook_not_found", "message": "Notebook not found"})

    await DocumentFile.find(DocumentFile.notebook_id == notebook_id).delete()

    await Message.find(Message.notebook_id == notebook_id).delete()

    await Conversation.find(Conversation.notebook_id == notebook_id).delete()

    await notebook.delete() 

    return MessageResponse(message="Notebook Deleted")



async def check_and_mark_stale(document : DocumentFile) :  

    if document.status != FileStatus.processing : 
        return document

    elapsed = datetime.now(timezone.utc) - document.updated_at.replace(tzinfo=timezone.utc)
    if elapsed > timedelta(minutes=PROCESSING_TIMEOUT_MINUTES) : 
        document.status = FileStatus.failed
        document.error_message = "Processing timed out. Please try uploading again."
        document.updated_at = datetime.now(timezone.utc)
        await document.save()
    return document



@router.get("/notebook/{notebook_id}/status")
async def get_notebook_status(notebook_id : PydanticObjectId, current_user : User = Depends(get_current_user)) : 
    notebook = await Notebook.get(notebook_id)
    if not notebook or notebook.user_id != current_user.id : 
        raise HTTPException(
            status_code=404,
            detail={
                "code" : "notebook_not_found",
                "message" : "Notebook not found"
            }
        )

    document = await DocumentFile.find_one(DocumentFile.notebook_id == notebook_id)

    if not document : 
        raise HTTPException(
            status_code=404,
            detail={"code": "document_not_found", "message": "Document not found"},
        )

    print(f"""
    ============================================================================
    Document : {document}
    ============================================================================
    """)

    document = await check_and_mark_stale(document)

    return {
        "data": {
            "status": document.status,
            "page_count": document.page_count,
            "total_chunks": document.total_chunks,
            "error_message": document.error_message,
        }
    }



@router.get("/notebook/{notebook_id}/messages")
async def get_messages( notebook_id : PydanticObjectId, current_user : User = Depends(get_current_user)) : 
    notebook = await Notebook.get(notebook_id)

    if not notebook or notebook.user_id != current_user.id : 
        raise HTTPException(
            status_code=404,
            detail={"code" : "notebook_not_found", "message" : "Notebook not found"}
        )

    messages = (
        await Message.find(Message.notebook_id == notebook.id)
        .sort(+Message.created_at)
        .to_list()
    )

    return {
        "data" : [
            {
                "id" : str(m.id),
                "role": m.role,
                "text": m.text,
                "citations": [c.dict() for c in m.citations] if m.citations else [],
                "created_at": m.created_at.isoformat(),
            }
            for m in messages
        ]
    }



@router.post("/notebook/{notebook_id}/chat")
async def send_message_stream(
    notebook_id: PydanticObjectId,
    payload: SendMessage,
    current_user: User = Depends(get_current_user),
):

    try : 
        notebook = await Notebook.get(notebook_id)
        if not notebook or notebook.user_id != current_user.id:
            raise HTTPException(
                status_code=404, 
                detail={"code": "notebook_not_found", "message": "Notebook not found"},
            )
    
        document = await DocumentFile.find_one(DocumentFile.notebook_id == notebook_id)
        if not document or document.status != FileStatus.ready:
            raise HTTPException(
                status_code=400,
                detail={"code": "document_not_ready", "message": "Document is not ready for questions yet"},
            )
    
        text = payload.text.strip()
        if not text:
            raise HTTPException(status_code=400, detail={"code": "empty_message", "message": "Message cannot be empty"})
    
        if len(text) > 4000:
            raise HTTPException(
                status_code=400,
                detail={"code": "message_too_long", "message": "Message is too long (max 4000 characters)"},
            )
    
        user_message = Message(notebook_id=notebook_id, role=MessageRole.user, text=text)
        await user_message.insert()
    
        async def event_generator():  
            full_answer = ""
            final_citations = []
            # try:
            async for sse_line in stream_answer(str(notebook_id), text):
                yield sse_line 
                if sse_line.startswith("event: done"):
                    data_line = sse_line.split("data: ", 1)[1]
                    parsed = json.loads(data_line)
                    full_answer = parsed["answer"]
                    final_citations = parsed["citations"]
            # finally:
            # FIX (BUG #4): try/finally me daala — pehle agar client beech me
            # disconnect ho jaata (tab band, network drop), ASGI generator ko
            # cancel kar deta tha aur ye insert() line kabhi chalti hi nahi thi —
            # poora generated answer khud jaata tha chahe LLM ne fully likh diya ho.
            # `finally` guarantee karta he ki jo bhi (partial ya complete) mila,
            # wo DB me save ho.
            if full_answer:
                assistant_message = Message(
                    notebook_id=notebook_id,
                    role=MessageRole.assistant,
                    text=full_answer,
                    citations=[Citation(**c) for c in final_citations],
                )
                await assistant_message.insert()
    
        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",  # nginx ke peeche deploy karo to zaroori
            },
        )
    except Exception as e :  
        # print(e)
        pass
    
    
    



@router.post("/pin-notebook/{notebook_id}") 
async def pin_notebook(notebook_id : PydanticObjectId, current_user : User = Depends(get_current_user)) : 

    notebook = await Notebook.get(notebook_id)

    if not notebook or notebook.user_id != current_user.id : 
        raise NotFoundError(message="Notebook not found")

    if notebook.pinned : 
        notebook.pinned=False
        notebook.pinned_at=None
    else :
        notebook.pinned = True
        notebook.pinned_at=datetime.now(timezone.utc) 

    await notebook.save()

    return {
        "data" : { 
            "notebook_id" : notebook.id,
            "pinned" :  notebook.pinned,
            "pinned_at" :  notebook.pinned_at
        }
    }
    



