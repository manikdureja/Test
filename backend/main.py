"""
backend/main.py
---------------
FastAPI application entry point for ImExIQ.
Start with: uvicorn backend.main:app --reload --port 8000
"""

import sys
from pathlib import Path

# Make project root importable regardless of where you run from
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.risk_routes import router as risk_router
from backend.api.forecast_routes import router as forecast_router
from backend.api.fx_routes import router as fx_router

app = FastAPI(
    title="ImExIQ API",
    description="Intelligent Import/Export Risk & Exposure Management",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # fallback
        "http://127.0.0.1:5173",   # Vite (127 host)
        "http://127.0.0.1:3000",   # fallback (127 host)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(risk_router)
app.include_router(forecast_router)
app.include_router(fx_router)

# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "app": "ImExIQ API", "docs": "/docs"}
