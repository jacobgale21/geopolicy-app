import os
import dotenv
from fastapi import APIRouter, Depends
from geocodio import Geocodio
from db import connection_scope
from auth import verify_token
from services.get_legislator_data import get_senator_state, get_representative_state

# Load environment variables
dotenv.load_dotenv()

app = APIRouter()

@app.get("/legislators/{address}")
async def get_legislators(address: str, token: str = Depends(verify_token)):
    geo_client = Geocodio(os.getenv("GEOCODIO_API_KEY"))
    response = geo_client.geocode(address, fields=["cd"])
    state = response.results[0].address_components.state
    cd = response.results[0].fields.congressional_districts[0].district_number

    try:
        with connection_scope() as conn:
            senators = get_senator_state(conn, state)
            representatives = get_representative_state(conn, state, cd)
            # Format senators for the state
            formatted_legislators = []
            for senator in senators:
                formatted_senator = {
                    "id": senator[0],
                    "name": senator[1],
                    "state": senator[2],
                    "party": senator[3],
                    "gender": senator[4],
                    "url": senator[5],
                    "address": senator[6],
                    "phone": senator[7],
                    "Role": "Senator",
                    "Nominate_Score": senator[9]
                }
                formatted_legislators.append(formatted_senator)
            # Format representatives for the state
            for representative in representatives:
                formatted_representative = {
                    "id": representative[0],
                    "name": representative[1],
                    "state": representative[2],
                    "party": representative[4],
                    "gender": representative[5],
                    "url": representative[6],
                    "address": representative[7],
                    "phone": representative[8],
                    "Role": "Representative",
                    "Nominate_Score": representative[10]
                }
                formatted_legislators.append(formatted_representative)

            return {"legislators": formatted_legislators}
    except Exception as e:
        return {"error": f"Database error: {str(e)}"}

__all__ = ["app"]
