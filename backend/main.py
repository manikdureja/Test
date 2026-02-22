
import sys
from pathlib import Path
import os

# Make project root importable regardless of where you run from
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))


def _load_env_file() -> None:
    env_path = PROJECT_ROOT / ".env"
    if not env_path.exists():
        return
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


_load_env_file()

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

cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]
if not cors_origins:
    cors_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
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
