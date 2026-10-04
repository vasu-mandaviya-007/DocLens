import json
from app.dependencies.auth_deps import get_current_user
from app.models.user import User
from fastapi import Depends, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from beanie import PydanticObjectId
from app.core.exceptions import ValidationAppError, NotFoundError
from app.models.notebook import Notebook
from app.models.notebook_file import DocumentFile, FileStatus
from app.models.message import Message, MessageRole, Citation
from app.services.usage_service import rollback_question_quota, log_question_asked, try_consume_question_quota
from app.schemas.notebook import SendMessage
from app.services.chat.chat_service import stream_answer
from app.utils.text_utils import strip_markdown
from app.schemas.auth import MessageResponse
import logging
from fastapi import status
router = APIRouter()

logger = logging.getLogger("uvicorn.error")



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
                # "citations": [c.dict() for c in m.citations] if m.citations else [],
                "citations": [
                    {**c.dict(), "plain": strip_markdown(c.snippet)}
                    for c in m.citations
                ] if m.citations else [], 
                "created_at": m.created_at.isoformat(),
            }
            for m in messages
        ]
    }




@router.delete("/notebook/delete-chat/{notebook_id}") 
async def delete_chat(notebook_id : PydanticObjectId, current_user : User = Depends(get_current_user)) :  
    notebook = await Notebook.get(notebook_id)  

    if not notebook or notebook.user_id != current_user.id : 
        raise NotFoundError(message="Notebook not found") 

    try :
        await Message.find(Message.notebook_id == notebook_id).delete()    

        return MessageResponse(message="Notebook Deleted")

    except Exception as e:
        logger.exception(f"Error while deleting chat history for notebook {notebook_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,  
            detail={"code": "delete_failed", "message": "Could not clear chat history. Please try again."}
        )



@router.post("/notebook/{notebook_id}/chat")  
async def send_message_stream(
    notebook_id: PydanticObjectId,
    payload: SendMessage,
    current_user: User = Depends(get_current_user),
):
 
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
                await rollback_question_quota(current_user.id)
 
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )



