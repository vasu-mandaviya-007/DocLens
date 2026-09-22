from fastapi_mail import FastMail, MessageSchema,ConnectionConfig
from starlette.responses import JSONResponse
from app.schemas.auth import ResendOtpRequest


conf = ConnectionConfig(
    MAIL_USERNAME="vasugajjar28@gmail.com", 
    MAIL_PASSWORD="jrqeaenibogkgdgd",
    MAIL_FROM="vasugajjar28@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False, 
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)


async def send_mail(email,otp): 

    template = f"""
        <html>
        <body>
        

        <p>Hi !!!
        <br>OTP : {otp}</p>


        </body>
        </html>
        """


    message = MessageSchema(
        subject="Fastapi-Mail module", 
        recipients=[email],  # List of recipients, as many as you can pass 
        body=template,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message) 
    print(message)


    return JSONResponse(status_code=200, content={"message": "email has been sent"})




