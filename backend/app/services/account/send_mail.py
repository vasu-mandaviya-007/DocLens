import logging
from brevo import AsyncBrevo
from brevo.transactional_emails import (
    SendTransacEmailRequestSender,
    SendTransacEmailRequestToItem
)
from app.core.config import settings

client = AsyncBrevo(api_key=settings.BREVO_API_KEY)


logger = logging.getLogger(__name__)


async def send_mail(subject: str, recipient: str, html_body: str) : 
    try :
        await client.transactional_emails.send_transac_email(
            subject=subject,
            sender=SendTransacEmailRequestSender(email=settings.SENDER_EMAIL, name=settings.SENDER_NAME),
            to=[SendTransacEmailRequestToItem(email=recipient)],
            html_content=html_body,
        )
    except Exception : 
        logger.exception(f"Brevo email send failed for {recipient}")
        raise