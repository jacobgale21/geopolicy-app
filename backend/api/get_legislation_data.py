import requests
from fastapi import APIRouter, Depends, HTTPException
from services.get_legislation_data import get_recent_legislation as service_recent_legislation_data
from db import connection_scope
from auth import verify_token
app = APIRouter()

@app.get("/get_recent_legislation")
async def get_recent_legislation_endpoint(token: str = Depends(verify_token)):
    try:
        return service_recent_legislation_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
__all__ = ["app"]