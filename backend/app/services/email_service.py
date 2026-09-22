from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType

from app.core.config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.EMAIL_USER, 
    MAIL_PASSWORD=settings.EMAIL_PASS,
    MAIL_FROM=settings.EMAIL_USER,
    MAIL_FROM_NAME="DocLens",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)

# FastMail instance ek hi jagah banate hain (singleton) — har request pe naya
# object banane ki zarurat nahi, connection config reuse hoga
fm = FastMail(conf)


def _build_otp_email(username: str, otp: str, expires_minutes: int, heading: str, subheading: str) -> str:
    """
    Common OTP email template — dono verification aur password reset ke liye reuse hota hai.
    Table-based layout use kiya hai kyunki Gmail/Outlook jaise email clients
    external CSS aur flexbox/grid ko properly support nahi karte — inline styles + tables
    hi sabse reliable render hote hain across clients.
    """
    return f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0; padding:0; background-color:#0f0f11; font-family:'Segoe UI', Roboto, Arial, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f11; padding:40px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#1a1a1d; border-radius:16px; overflow:hidden; border:1px solid #2a2a2e;">
              <tr>
                <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6); padding:28px 32px;">
                  <span style="color:#ffffff; font-size:22px; font-weight:700; letter-spacing:0.5px;">DocLens</span>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;">
                  <p style="color:#f4f4f5; font-size:18px; font-weight:600; margin:0 0 8px;">{heading}</p>
                  <p style="color:#a1a1aa; font-size:14px; margin:0 0 24px; line-height:1.5;">
                    Hi {username}, {subheading}
                  </p>
                  <div style="background-color:#0f0f11; border:1px dashed #3f3f46; border-radius:12px; padding:20px; text-align:center; margin-bottom:24px;">
                    <span style="color:#c4b5fd; font-size:32px; font-weight:700; letter-spacing:8px;">{otp}</span>
                  </div>
                  <p style="color:#71717a; font-size:13px; margin:0 0 4px;">
                    This code expires in <strong style="color:#a1a1aa;">{expires_minutes} minutes</strong>.
                  </p>
                  <p style="color:#71717a; font-size:13px; margin:0;">
                    If you didn't request this, you can safely ignore this email.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 32px; border-top:1px solid #2a2a2e;">
                  <p style="color:#52525b; font-size:12px; margin:0;">© DocLens · Document Q&amp;A, reimagined.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """


async def _send_email(subject: str, recipient: str, html_body: str) -> None:
    message = MessageSchema(
        subject=subject,
        recipients=[recipient],
        body=html_body,
        subtype=MessageType.html,
    )
    await fm.send_message(message)


async def send_verification_otp_email(email: str, username: str, otp: str, expires_minutes: int) -> None:
    html = _build_otp_email(
        username=username,
        otp=otp,
        expires_minutes=expires_minutes,
        heading="Verify your email",
        subheading="use the code below to verify your DocLens account.",
    )
    await _send_email(subject="Verify your DocLens account", recipient=email, html_body=html)


async def send_password_reset_otp_email(email: str, username: str, otp: str, expires_minutes: int) -> None:
    html = _build_otp_email(
        username=username,
        otp=otp,
        expires_minutes=expires_minutes,
        heading="Reset your password",
        subheading="use the code below to reset your DocLens password.",
    )
    await _send_email(subject="Reset your DocLens password", recipient=email, html_body=html)