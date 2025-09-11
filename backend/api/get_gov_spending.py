import requests
from fastapi import APIRouter, Depends
from services.get_federal_spending import get_agency_data, get_budget_functions
from db import connection_scope
from auth import verify_token
from helper import translate_state

app = APIRouter()

@app.get("/get_agency_spending")
async def get_agency_spending(token: str = Depends(verify_token)):
    with connection_scope() as conn:
        agency_data = get_agency_data(conn)
        budget_functions_data = get_budget_functions(conn)
        return {"agency_data": agency_data, "budget_functions_data": budget_functions_data}