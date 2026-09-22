# from app.config.db import db

# user_collection = db["users"]

# async def find_user_by_email(email : str) -> dict | None:
#     return await user_collection.find_one({"email": email})

from app.models.User import User

async def find_user_by_email(email : str) -> dict | None: 
    return await User.find_one(User.email==email)  



 