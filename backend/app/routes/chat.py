import json
from app.dependencies.auth_deps import get_current_user
from app.models.User import User
from fastapi import Depends, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from beanie import PydanticObjectId
from app.core.exceptions import ValidationAppError, NotFoundError
from app.models.notebook import Notebook
from app.models.notebook_file import DocumentFile, FileStatus
from app.models.message import Message, MessageRole, Citation
from app.routes.quota import rollback_question_quota, log_question_asked, try_consume_question_quota
from app.schemas.notebook import SendMessage
from app.services.chat_service import stream_answer
router = APIRouter()




@router.get("/notebook/{notebook_id}/messages")
async def get_messages(
    notebook_id: PydanticObjectId, current_user: User = Depends(get_current_user)
):
    notebook = await Notebook.get(notebook_id)

    if not notebook or notebook.user_id != current_user.id:
        raise HTTPException(
            status_code=404,
            detail={"code": "notebook_not_found", "message": "Notebook not found"},
        )

    messages = (
        await Message.find(Message.notebook_id == notebook.id)
        .sort(+Message.created_at)
        .to_list()
    )

    return {
        "data": [
            {
                "id": str(m.id),
                "role": m.role,
                "text": m.text,
                "citations": [c.dict() for c in m.citations] if m.citations else [],
                "created_at": m.created_at.isoformat(),
            }
            for m in messages
        ]
    }


# @router.post("/notebook/{notebook_id}/chat")
# async def send_message_stream(
#     notebook_id: PydanticObjectId,
#     payload: SendMessage,
#     current_user: User = Depends(get_current_user),
# ):

#     try:
#         notebook = await Notebook.get(notebook_id)
#         if not notebook or notebook.user_id != current_user.id:
#             raise NotFoundError(message="Notebook not found")

#         document = await DocumentFile.find_one(DocumentFile.notebook_id == notebook_id)

#         if not document or document.status != FileStatus.ready:
#             raise HTTPException(
#                 status_code=400,
#                 detail={
#                     "code": "document_not_ready",
#                     "message": "Document is not ready for questions yet",
#                 },
#             )

#         text = payload.text.strip()

#         if not text:
#             raise HTTPException(
#                 status_code=400,
#                 detail={"code": "empty_message", "message": "Message cannot be empty"},
#             )

#         if len(text) > 500:
#             raise HTTPException(
#                 status_code=400,
#                 detail={
#                     "code": "message_too_long",
#                     "message": "Message is too long (max 500 characters)",
#                 },
#             )

#         user_message = Message(
#             notebook_id=notebook_id, role=MessageRole.user, text=text
#         )
#         await user_message.insert()

#         async def event_generator(): 
#             full_answer = ""
#             final_citations = []

#             try:

#                 async for sse_line in stream_answer(str(notebook_id), text):
#                     yield sse_line
#                     if sse_line.startswith("event: done"):
#                         data_line = sse_line.split("data: ", 1)[1]
#                         parsed = json.loads(data_line)
#                         full_answer = parsed["answer"]
#                         final_citations = parsed["citations"]

#             finally:
#                 print(full_answer)
#                 if full_answer:
#                     assistant_message = Message(
#                         notebook_id=notebook_id,
#                         role=MessageRole.assistant,
#                         text=full_answer,
#                         citations=[Citation(**c) for c in final_citations],
#                     )

#                     await assistant_message.insert()

#         return StreamingResponse(
#             event_generator(),
#             media_type="text/event-stream",
#             headers={
#                 "Cache-Control": "no-cache",
#                 "X-Accel-Buffering": "no",
#             },
#         )

#     except Exception as e:
#         print(e)




@router.post("/notebook/{notebook_id}/chat")
async def send_message_stream(
    notebook_id: PydanticObjectId,
    payload: SendMessage,
    current_user: User = Depends(get_current_user),
):
    # NOTE: pehle poori function ek `try/except Exception: print(e)` ke andar thi —
    # iska matlab NotFoundError, "document not ready", "empty message",
    # "message too long" — ye sab errors silently swallow ho rahe the aur
    # frontend ko ek broken/empty response milta tha. Ab in errors ko
    # properly propagate hone diya ja raha hai (jaise tumhare baaki routes
    # mein already hota hai), aur raw HTTPException ki jagah tumhare
    # AppException subclasses use kiye hain taaki error response shape
    # poore app mein consistent rahe ({"error": {...}}).
 
    notebook = await Notebook.get(notebook_id)
    if not notebook or notebook.user_id != current_user.id:
        raise NotFoundError("Notebook not found")
 
    document = await DocumentFile.find_one(DocumentFile.notebook_id == notebook_id)
 
    if not document or document.status != FileStatus.ready:
        raise ValidationAppError(
            "Document is not ready for questions yet",
            fields={"document": "document_not_ready"},
        )
 
    text = payload.text.strip()
 
    if not text:
        raise ValidationAppError(
            "Message cannot be empty", fields={"text": "empty_message"}
        )
 
    if len(text) > 500:
        raise ValidationAppError(
            "Message is too long (max 500 characters)",
            fields={"text": "message_too_long"},
        )
 
    # Quota upload_document ke jaisa hi pattern: actual kaam (LLM call) shuru
    # karne se PEHLE consume karo, taaki limit-cross hone par koi partial
    # kaam na ho. Ye line pehle missing thi — QUESTION_LIMIT kabhi enforce
    # hi nahi ho raha tha.
    await try_consume_question_quota(current_user.id)
 
    try:
        user_message = Message(
            notebook_id=notebook_id, role=MessageRole.user, text=text
        )
        await user_message.insert()
    except Exception:
        await rollback_question_quota(current_user.id)
        raise
 
    async def event_generator():
        full_answer = ""
        final_citations = []
 
        try:
            async for sse_line in stream_answer(str(notebook_id), text):
                yield sse_line
                if sse_line.startswith("event: done"):
                    data_line = sse_line.split("data: ", 1)[1]
                    parsed = json.loads(data_line)
                    full_answer = parsed["answer"]
                    final_citations = parsed["citations"]
        finally:
            if full_answer:
                assistant_message = Message(
                    notebook_id=notebook_id,
                    role=MessageRole.assistant,
                    text=full_answer,
                    citations=[Citation(**c) for c in final_citations],
                )
                await assistant_message.insert()
                await log_question_asked(current_user.id)
            else:
                # Stream fail ho gaya aur koi answer generate hi nahi hua —
                # quota wapas de do, warna user ka question "use" ho jaayega
                # bina kisi jawab ke.
                await rollback_question_quota(current_user.id)
 
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )



