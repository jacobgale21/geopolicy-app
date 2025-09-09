import requests
from fastapi import APIRouter, Depends
from services.get_state_census import get_state_census_data as service_state_census_data
from db import connection_scope
from auth import verify_token
from helper import translate_state
app = APIRouter()

@app.get("/get_census_data/{state}")
async def get_census_data_endpoint(state: str, token: str = Depends(verify_token)):
    try:
        with connection_scope() as conn:
            state = translate_state(state)
            return service_state_census_data(conn, state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
__all__ = ["app"]