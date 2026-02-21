"""
backend/api/risk_routes.py
---------------------------
FastAPI router for Supply Chain Risk Scoring endpoints.
Uses models trained on synthetic data by ml/risk_scoring/train.py.

Mount in main app:
    from backend.api.risk_routes import router as risk_router
    app.include_router(risk_router)
"""

import os
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, validator

router = APIRouter(prefix="/api/risk", tags=["Risk Scoring"])

ARTIFACTS_DIR = os.getenv("RISK_ARTIFACTS_DIR", "ml/risk_scoring/artifacts")


# ── Request / Response schemas ────────────────────────────────────────────────

class RiskInput(BaseModel):
    supplier_reliability: float = Field(..., ge=0.6,  le=1.0,   description="Supplier reliability score (0.6–1.0)")
    transport_delay_days: int   = Field(..., ge=0,    le=20,    description="Transport delay in days (0–20)")
    geo_political_risk:   float = Field(..., ge=0.0,  le=1.0,   description="Geo-political risk index (0–1)")
    weather_risk:         float = Field(..., ge=0.0,  le=1.0,   description="Weather disruption risk (0–1)")
    inventory_level:      int   = Field(..., ge=50,   le=600,   description="Current inventory units (50–600)")
    currency_volatility:  float = Field(..., ge=0.0,  le=0.1,   description="Currency volatility (0–0.1)")

    class Config:
        schema_extra = {
            "example": {
                "supplier_reliability": 0.75,
                "transport_delay_days": 5,
                "geo_political_risk": 0.6,
                "weather_risk": 0.3,
                "inventory_level": 200,
                "currency_volatility": 0.05,
            }
        }


class FeatureContribution(BaseModel):
    normalised_value: float
    importance: float
    contribution: float


class RiskResult(BaseModel):
    risk_score: float
    risk_score_pct: float
    risk_tier: str
    risk_color: str
    model_used: str
    feature_contributions: Dict[str, FeatureContribution]
    input_features: Dict[str, float]


class BatchRiskInput(BaseModel):
    records: List[RiskInput]


class ModelInfo(BaseModel):
    model_name: str
    r2: float
    rmse: float
    mae: float
    mape_pct: float
    cv_r2_mean: float
    cv_r2_std: float
    feature_importances: Dict[str, float]
    is_best: bool


# ── Helpers ───────────────────────────────────────────────────────────────────

def _scorer():
    try:
        from ml.risk_scoring.predict import get_scorer
        return get_scorer(ARTIFACTS_DIR)
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Risk models not trained yet. Run: python ml/risk_scoring/train.py — {e}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _input_to_dict(inp: RiskInput) -> dict:
    return inp.dict()


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/score", response_model=RiskResult)
def score_single(body: RiskInput):
    """
    Score a single deal or shipment.
    Returns risk_score (0–1), risk_tier, and per-feature contributions.
    """
    scorer = _scorer()
    result = scorer.predict_one(_input_to_dict(body))
    return result


@router.post("/score/batch", response_model=List[RiskResult])
def score_batch(body: BatchRiskInput):
    """Score up to 100 records in one call."""
    if len(body.records) > 100:
        raise HTTPException(status_code=400, detail="Batch size limit is 100 records.")
    scorer = _scorer()
    return scorer.predict_batch([_input_to_dict(r) for r in body.records])


@router.get("/models", response_model=List[ModelInfo])
def list_models():
    """Return performance metrics for all three trained models."""
    scorer = _scorer()
    meta = scorer.all_metrics
    cv   = scorer._meta.get("cv_scores", {})
    best = scorer._meta.get("best_model", "")
    imps = scorer._meta.get("feature_importances", {})

    result = []
    for m in meta:
        name = m["model"]
        result.append(ModelInfo(
            model_name=name,
            r2=m.get("R2", 0),
            rmse=m.get("RMSE", 0),
            mae=m.get("MAE", 0),
            mape_pct=m.get("MAPE_pct", 0),
            cv_r2_mean=cv.get(name, {}).get("mean", 0),
            cv_r2_std=cv.get(name, {}).get("std", 0),
            feature_importances=imps.get(name, {}),
            is_best=(name == best),
        ))
    return result


@router.get("/health")
def health():
    """Check if risk models are loaded and ready."""
    try:
        scorer = _scorer()
        m = scorer.metrics
        return {
            "status": "ok",
            "model": scorer.model_name,
            "r2": m.get("R2"),
            "artifacts_dir": ARTIFACTS_DIR,
        }
    except HTTPException as e:
        return {"status": "not_ready", "detail": e.detail}


@router.get("/features")
def feature_info():
    """Return feature definitions and valid input ranges."""
    return {
        "features": [
            {"name": "supplier_reliability",  "type": "float", "range": [0.6, 1.0],  "description": "Reliability score of primary supplier"},
            {"name": "transport_delay_days",  "type": "int",   "range": [0, 20],     "description": "Expected transit delay in days"},
            {"name": "geo_political_risk",    "type": "float", "range": [0.0, 1.0],  "description": "Country/region geo-political risk index"},
            {"name": "weather_risk",          "type": "float", "range": [0.0, 1.0],  "description": "Probability of weather disruption"},
            {"name": "inventory_level",       "type": "int",   "range": [50, 600],   "description": "Current inventory on hand (units)"},
            {"name": "currency_volatility",   "type": "float", "range": [0.0, 0.1],  "description": "30-day currency pair volatility (decimal)"},
        ],
        "target": {
            "name": "risk_score",
            "range": [0.0, 1.0],
            "tiers": [
                {"label": "LOW",      "range": [0.00, 0.25], "color": "#10b981"},
                {"label": "MEDIUM",   "range": [0.25, 0.50], "color": "#f59e0b"},
                {"label": "HIGH",     "range": [0.50, 0.75], "color": "#f97316"},
                {"label": "CRITICAL", "range": [0.75, 1.00], "color": "#ef4444"},
            ],
        },
    }