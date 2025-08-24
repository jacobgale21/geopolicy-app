
import psycopg2
from psycopg2 import Error
import pandas as pd
import os
import dotenv
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from geocodio import Geocodio
from middleware import verify_token
from fastapi import Depends, FastAPI
# Load environment variables
dotenv.load_dotenv()

db_config = {
    "host":  "localhost",
    "database": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "port": os.getenv("DB_PORT")
}

app = FastAPI()
app.add_middleware(
CORSMiddleware,
allow_origins=["*"],
allow_credentials=True,
allow_methods=["*"],
allow_headers=["*"],
)

@app.get("/legislators/{address}")
async def get_legislators(address: str, token: str = Depends(verify_token)):
    geo_client = Geocodio(os.getenv("GEOCODIO_API_KEY"))
    response = geo_client.geocode(address, fields=["cd"])
    state = response.results[0].address_components.state
    cd = response.results[0].fields.congressional_districts[0].district_number
    conn = None
    cur = None
    try:
        conn = psycopg2.connect(**db_config)
        cur = conn.cursor()
        cur.execute("SELECT * FROM Senators WHERE state = %s", (state,))
        senators = cur.fetchall()
        
        # Convert database tuples to dictionaries with named properties
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
                "Role": "Senator"
            }
            formatted_legislators.append(formatted_senator)
        cur.execute("SELECT * FROM Representatives WHERE state = %s AND district = %s", (state, cd))
        representatives = cur.fetchall()
        
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
                "Role": "Representative"
            }
            formatted_legislators.append(formatted_representative)
        return {"legislators": formatted_legislators}
        
    except Exception as e:
        return {"error": f"Database error: {str(e)}"}
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
