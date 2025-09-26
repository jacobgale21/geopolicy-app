import requests
from fastapi import APIRouter, Depends, HTTPException
from services.user_interests import fetch_user_interests, save_user_interests
from db import connection_scope
from auth import verify_token
from pydantic import BaseModel
from typing import List

app = APIRouter()

class UserInterests(BaseModel):
    interests: List[str]

@app.post("/save_user_interests")
async def save_user_interests_endpoint(interests: UserInterests, user_id: str = Depends(verify_token)):
    try:
        with connection_scope() as conn:
            save_user_interests(conn, user_id, interests.interests)
        return {"status": "success", "message": "User interests saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/get_user_interests")
async def get_user_interests_endpoint(user_id: str = Depends(verify_token)):
    try:
        with connection_scope() as conn:
            interests = fetch_user_interests(conn, user_id)
            if interests:
                return {"interests": interests}
            else:
                return {"interests": [], "message": "No interests found"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
__all__ = ["app"]