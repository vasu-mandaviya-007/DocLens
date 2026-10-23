
from app.models.user import User

async def find_user_by_email(email : str) -> dict | None: 
    return await User.find_one(User.email==email)  



 