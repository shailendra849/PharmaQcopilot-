from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, engine
from app.routers import complaints

settings = get_settings()

app = FastAPI(
    title="AIVOA Complaint Management System",
    description="AI-powered customer complaint intake for pharma API/FDF QA",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complaints.router)


@app.on_event("startup")
def on_startup():
    # For the assignment scope, auto-create tables. In a real deployment
    # this would be replaced by Alembic migrations.
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"status": "ok"}
