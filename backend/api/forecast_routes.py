"""
backend/api/forecast_routes.py
-----------------------------
FastAPI router for Price Forecast endpoints.
Uses synthetic commodity price data from data/synthetic_commodity_prices.csv.
"""

import os
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/forecast", tags=["Price Forecast"])

DATA_DIR = os.getenv("DATA_DIR", str(Path(__file__).resolve().parents[2] / "data"))
PRICES_CSV = Path(DATA_DIR) / "synthetic_commodity_prices.csv"


def _load_prices() -> pd.DataFrame:
    if not PRICES_CSV.exists():
        raise HTTPException(
            status_code=503,
            detail=f"Commodity price data not found. Run: python data_processing/generate_synthetic_data.py — expected {PRICES_CSV}",
        )
    df = pd.read_csv(PRICES_CSV)
    if df.empty or "commodity" not in df.columns or "year" not in df.columns or "price" not in df.columns:
        raise HTTPException(status_code=503, detail="Invalid commodity price CSV format.")
    return df


def _commodity_meta(df: pd.DataFrame, name: str) -> Dict[str, Any]:
    sub = df[df["commodity"] == name].sort_values("year")
    if sub.empty:
        raise HTTPException(status_code=404, detail=f"Commodity '{name}' not found.")
    hist_years = sub["year"].tolist()
    hist_vals = sub["price"].tolist()
    latest_price = hist_vals[-1]
    prev_price = hist_vals[-2] if len(hist_vals) > 1 else latest_price
    yoy_pct = (latest_price - prev_price) / prev_price * 100 if prev_price else 0
    row = sub.iloc[-1]
    return {
        "name": name,
        "category": row.get("category", "Industrial"),
        "unit": row.get("unit", "$/mt"),
        "latest_price": latest_price,
        "latest_year": int(hist_years[-1]),
        "yoy_pct": round(yoy_pct, 2),
        "hist_years": hist_years,
        "hist_vals": hist_vals,
    }


def _forecast_linear(y: np.ndarray, h: int) -> tuple:
    """Linear trend extrapolation."""
    n = len(y)
    x = np.arange(n)
    coeffs = np.polyfit(x, y, 1)
    fore = np.polyval(coeffs, np.arange(n, n + h))
    return fore.tolist()


def _forecast_exp_smooth(y: np.ndarray, h: int, alpha: float = 0.3) -> tuple:
    """Exponential smoothing forecast."""
    s = y[0]
    for v in y[1:]:
        s = alpha * v + (1 - alpha) * s
    fore = [s] * h
    return fore


def _forecast_moving_avg(y: np.ndarray, h: int, w: int = 5) -> tuple:
    """Moving average forecast (flat)."""
    if len(y) < w:
        w = len(y)
    ma = np.mean(y[-w:])
    return [ma] * h


def _mape(actual: np.ndarray, pred: np.ndarray) -> float:
    """Mean absolute percentage error."""
    mask = actual != 0
    if not mask.any():
        return 0
    return float(np.mean(np.abs((actual[mask] - pred[mask]) / actual[mask])) * 100)


def _signal(target: float, current: float, ret_pct: float) -> str:
    if ret_pct >= 5:
        return "BUY"
    if ret_pct <= -5:
        return "SELL"
    return "HOLD"


@router.get("/commodities")
def list_commodities() -> List[Dict[str, Any]]:
    """Return list of commodities with metadata for Price Forecast UI."""
    df = _load_prices()
    names = df["commodity"].unique().tolist()
    return [_commodity_meta(df, n) for n in names]


@router.get("/forecast/{commodity}")
def get_forecast(
    commodity: str,
    horizon: int = 5,
    active_model: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Return historical prices plus forecast from Linear Trend, Exp. Smoothing, Moving Avg., Ensemble.
    """
    df = _load_prices()
    sub = df[df["commodity"] == commodity].sort_values("year")
    if sub.empty:
        raise HTTPException(status_code=404, detail=f"Commodity '{commodity}' not found.")

    y = sub["price"].values
    hist_years = sub["year"].tolist()
    historical = [{"year": int(yr), "value": float(v)} for yr, v in zip(sub["year"], sub["price"])]
    last_year = int(hist_years[-1])
    fore_years = list(range(last_year + 1, last_year + 1 + horizon))

    # Forecasts
    lin = _forecast_linear(y, horizon)
    exp = _forecast_exp_smooth(y, horizon)
    mov = _forecast_moving_avg(y, horizon)
    ens = [(a + b + c) / 3 for a, b, c in zip(lin, exp, mov)]

    # In-sample MAPE (use last 10 years for validation)
    n_val = min(10, len(y) - 1)
    if n_val >= 1:
        train_y = y[:-n_val]
        val_y = y[-n_val:]
        lin_val = _forecast_linear(train_y, n_val)
        exp_val = _forecast_exp_smooth(train_y, n_val)
        mov_val = _forecast_moving_avg(train_y, n_val)
        ens_val = [(a + b + c) / 3 for a, b, c in zip(lin_val, exp_val, mov_val)]
        mape_lin = _mape(np.array(val_y), np.array(lin_val))
        mape_exp = _mape(np.array(val_y), np.array(exp_val))
        mape_mov = _mape(np.array(val_y), np.array(mov_val))
        mape_ens = _mape(np.array(val_y), np.array(ens_val))
    else:
        mape_lin = mape_exp = mape_mov = mape_ens = 0

    # Confidence bands (±15% of forecast)
    def band(vals, pct=0.15):
        return [v * (1 - pct) for v in vals], [v * (1 + pct) for v in vals]

    current = float(y[-1])
    target = ens[-1]
    ret_pct = (target - current) / current * 100 if current else 0
    signal = _signal(target, current, ret_pct)

    models = {
        "Linear Trend": {
            "fore_vals": lin,
            "fore_upper": band(lin)[1],
            "fore_lower": band(lin)[0],
            "mape": round(mape_lin, 1),
            "signal": signal,
        },
        "Exp. Smoothing": {
            "fore_vals": exp,
            "fore_upper": band(exp)[1],
            "fore_lower": band(exp)[0],
            "mape": round(mape_exp, 1),
            "signal": signal,
        },
        "Moving Avg.": {
            "fore_vals": mov,
            "fore_upper": band(mov)[1],
            "fore_lower": band(mov)[0],
            "mape": round(mape_mov, 1),
            "signal": signal,
        },
        "Ensemble": {
            "fore_vals": ens,
            "fore_upper": band(ens)[1],
            "fore_lower": band(ens)[0],
            "mape": round(mape_ens, 1),
            "signal": signal,
        },
    }

    return {
        "historical": historical,
        "fore_years": fore_years,
        "models": models,
    }
