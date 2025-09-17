import requests
from fastapi import APIRouter, Depends
from services.get_health_data import get_health_data_states as service_health_data_states
from db import connection_scope
from auth import verify_token
app = APIRouter()

@app.get("/get_health_data/{state}/{name}")
async def get_health_data_endpoint(state: str, name: str, token: str = Depends(verify_token)):
    try:
        with connection_scope() as conn:
            return service_health_data_states(conn, state, name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
__all__ = ["app"]