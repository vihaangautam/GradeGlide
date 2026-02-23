"""
main.py — GradeGlide FastAPI application entry point.
Run with: uvicorn main:app --reload --port 8000
"""
import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

load_dotenv()

from database import engine, Base
import models  # noqa: F401 — ensures all models are registered for table creation

# ── Create all DB tables on startup ─────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── Ensure uploads directory exists ─────────────────────────────────────────
Path("uploads").mkdir(exist_ok=True)

app = FastAPI(
    title="GradeGlide API",
    description="AI-powered answer sheet grading for CBSE/ICSE tutors",
    version="0.1.0",
)

# ── CORS — allow the React dev server ───────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Serve uploaded images directly (for the answer sheet viewer) ─────────────
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ── Include API routers ──────────────────────────────────────────────────────
from api.upload import router as upload_router
from api.grading import router as grading_router
from api.export import router as export_router

app.include_router(upload_router)
app.include_router(grading_router)
app.include_router(export_router)


@app.get("/")
def health():
    return {
        "status": "ok",
        "service": "GradeGlide API",
        "docs": "/docs",
    }
