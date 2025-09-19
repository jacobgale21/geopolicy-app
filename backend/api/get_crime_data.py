import requests
from fastapi import APIRouter, Depends
from services.get_state_crime import get_crime_data as service_get_crime_data
from services.get_state_crime import get_all_state_crime as service_get_all_state_crime
from db import connection_scope
from auth import verify_token
from helper import translate_state
app = APIRouter()

@app.get("/get_crime_data/{state}/{crime_type}")
async def get_crime_data_endpoint(state: str, crime_type: str, token: str = Depends(verify_token)):
    state = translate_state(state)
    with connection_scope() as conn:
        return service_get_crime_data(conn, state, crime_type)

@app.get("/get_all_state_crime/{state}")
async def get_all_state_crime_endpoint(state: str, token: str = Depends(verify_token)):
    state = translate_state(state)
    with connection_scope() as conn:
        return service_get_all_state_crime(conn, state)

__all__ = ["app"]