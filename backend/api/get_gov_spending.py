import requests
from fastapi import APIRouter, Depends
from services.get_federal_spending import get_agency_data, get_budget_functions, get_federal_economic_data, get_federal_debt, get_treasury_statements
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

@app.get("/get_federal_economic_data")
async def get_federal_economic_data_endpoint(token: str = Depends(verify_token)):
    with connection_scope() as conn:
        economic_data = get_federal_economic_data(conn)
        return {"economic_data": economic_data}

@app.get("/get_federal_debt")
async def get_federal_debt_endpoint(token: str = Depends(verify_token)):
    with connection_scope() as conn:
        federal_debt = get_federal_debt(conn)
        treasury_statements = get_treasury_statements()
        return {"federal_debt": federal_debt, "treasury_statements": treasury_statements}

__all__ = ["app"]