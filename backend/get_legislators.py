
import psycopg2
from psycopg2 import Error
import pandas as pd
import os
import dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
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

@app.get("/legislators/{state}")
async def get_legislators(state):
    conn = None
    cur = None
    try:
        conn = psycopg2.connect(**db_config)
        cur = conn.cursor()
        cur.execute("SELECT * FROM Senators WHERE state = %s", (state,))
        senators = cur.fetchall()
        
        # Convert database tuples to dictionaries with named properties
        formatted_senators = []
        for senator in senators:
            formatted_senator = {
                "id": senator[0],
                "name": senator[1],
                "state": senator[2],
                "party": senator[3],
                "gender": senator[4],
                "url": senator[5],
                "address": senator[6],
                "phone": senator[7]
            }
            formatted_senators.append(formatted_senator)
        
        return {"legislators": formatted_senators}
        
    except Exception as e:
        return {"error": f"Database error: {str(e)}"}
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
