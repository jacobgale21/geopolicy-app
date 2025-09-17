import uvicorn
from fastapi import FastAPI
from api import get_crime_data, get_census_data, get_gov_spending, get_health_data
from get_legislators import app as legislators_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Register your routers with prefixes and tags
app.include_router(get_crime_data.app)
app.include_router(legislators_router)
app.include_router(get_census_data.app)
app.include_router(get_gov_spending.app)
app.include_router(get_health_data.app)

# Optional: Add a root endpoint
@app.get("/")
async def root():
    return {"message": "Real Estate API is running!", "docs": "/docs"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
    