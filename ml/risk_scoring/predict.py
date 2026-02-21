import json
import pickle
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import numpy as np
import pandas as pd


# ── Constants ──────────────────────────────────────────────────────────────────

FEATURE_COLS = [
    "supplier_reliability",
    "transport_delay_days",
    "geo_political_risk",
    "weather_risk",
    "inventory_level",
    "currency_volatility",
]

FEATURE_RANGES = {
    "supplier_reliability":  (0.6,  1.0),
    "transport_delay_days":  (0,    20),
    "geo_political_risk":    (0.0,  1.0),
    "weather_risk":          (0.0,  1.0),
    "inventory_level":       (50,   600),
    "currency_volatility":   (0.0,  0.1),
}

RISK_BINS   = [0.0, 0.25, 0.50, 0.75, 1.01]
RISK_LABELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
RISK_COLORS = {"LOW": "#10b981", "MEDIUM": "#f59e0b", "HIGH": "#f97316", "CRITICAL": "#ef4444"}


def _score_to_tier(score: float) -> str:
    for i, (lo, hi) in enumerate(zip(RISK_BINS[:-1], RISK_BINS[1:])):
        if lo <= score < hi:
            return RISK_LABELS[i]
    return RISK_LABELS[-1]


# ── Loader ─────────────────────────────────────────────────────────────────────

class RiskScorer:
    """
    Wraps a trained risk scoring model for inference.
    Loads from pickle artifacts produced by train.py.
    """

    def __init__(
        self,
        artifacts_dir: str = "ml/risk_scoring/artifacts",
        model_name: Optional[str] = None,   # None = use best from metadata
    ):
        self.artifacts_dir = Path(artifacts_dir)
        self._model    = None
        self._scaler   = None
        self._meta     = {}
        self._model_name = model_name

        self._load()

    def _load(self) -> None:
        """Load model pickle and metadata JSON."""
        meta_path = self.artifacts_dir / "metadata.json"
        if not meta_path.exists():
            raise FileNotFoundError(
                f"No metadata.json found at {meta_path}. "
                "Run ml/risk_scoring/train.py first."
            )

        with open(meta_path) as f:
            self._meta = json.load(f)

        # Resolve which model to load
        name = self._model_name or self._meta.get("best_model", "gradient_boosting")
        pkl_path = self.artifacts_dir / f"{name}.pkl"

        if not pkl_path.exists():
            raise FileNotFoundError(f"Model artifact not found: {pkl_path}")

        with open(pkl_path, "rb") as f:
            artifact = pickle.load(f)

        self._model       = artifact["model"]
        self._scaler      = artifact.get("scaler")
        self._model_name  = name

    # ── Validation ────────────────────────────────────────────────────────────

    def _validate(self, features: Dict[str, Any]) -> Dict[str, float]:
        """Validate and normalise a single feature dict. Raises ValueError on bad input."""
        errors = []
        cleaned = {}

        for col in FEATURE_COLS:
            if col not in features:
                errors.append(f"Missing feature: '{col}'")
                continue

            val = features[col]
            try:
                val = float(val)
            except (TypeError, ValueError):
                errors.append(f"'{col}' must be numeric, got {type(val).__name__}")
                continue

            lo, hi = FEATURE_RANGES[col]
            if not (lo <= val <= hi):
                errors.append(f"'{col}' out of range [{lo}, {hi}], got {val}")
            cleaned[col] = val

        if errors:
            raise ValueError("Validation errors:\n  " + "\n  ".join(errors))

        return cleaned

    # ── Inference ─────────────────────────────────────────────────────────────

    def predict_one(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Score a single deal/shipment.

        Args:
            features: Dict with the 6 supply chain feature keys

        Returns:
            Dict with risk_score, risk_tier, risk_color, confidence,
                  feature_contributions, model_used
        """
        cleaned = self._validate(features)
        X = pd.DataFrame([cleaned])[FEATURE_COLS]

        if self._scaler:
            X_inp = self._scaler.transform(X)
        else:
            X_inp = X.values

        score = float(np.clip(self._model.predict(X_inp)[0], 0.0, 1.0))
        tier  = _score_to_tier(score)

        # Feature contributions (approximate using feature importances)
        contribs = self._feature_contributions(cleaned, score)

        return {
            "risk_score":           round(score, 4),
            "risk_score_pct":       round(score * 100, 1),
            "risk_tier":            tier,
            "risk_color":           RISK_COLORS[tier],
            "model_used":           self._model_name,
            "feature_contributions": contribs,
            "input_features":       cleaned,
        }

    def predict_batch(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Score a batch of records. Returns list of predict_one results."""
        return [self.predict_one(r) for r in records]

    def predict_df(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Score an entire DataFrame. Adds risk_score and risk_tier columns.
        Input DataFrame must have the 6 feature columns.
        """
        missing = [c for c in FEATURE_COLS if c not in df.columns]
        if missing:
            raise ValueError(f"DataFrame missing columns: {missing}")

        X = df[FEATURE_COLS]
        inp = self._scaler.transform(X) if self._scaler else X.values

        scores = np.clip(self._model.predict(inp), 0.0, 1.0)
        out = df.copy()
        out["risk_score"] = scores.round(4)
        out["risk_tier"]  = [_score_to_tier(s) for s in scores]
        return out

    def _feature_contributions(self, features: Dict[str, float], total_score: float) -> Dict[str, Dict]:
        """
        Approximate each feature's contribution to the risk score
        using model feature importances × normalised feature values.
        """
        if hasattr(self._model, "feature_importances_"):
            importances = dict(zip(FEATURE_COLS, self._model.feature_importances_))
        elif hasattr(self._model, "coef_"):
            raw = np.abs(self._model.coef_)
            importances = dict(zip(FEATURE_COLS, raw / raw.sum()))
        else:
            importances = {f: 1 / len(FEATURE_COLS) for f in FEATURE_COLS}

        # Normalised feature values (0→1 scale, higher = more risky)
        norm = {
            "supplier_reliability":  round(1 - features["supplier_reliability"],  3),
            "transport_delay_days":  round(features["transport_delay_days"] / 20, 3),
            "geo_political_risk":    round(features["geo_political_risk"],          3),
            "weather_risk":          round(features["weather_risk"],                3),
            "inventory_level":       round(1 - features["inventory_level"] / 600,  3),
            "currency_volatility":   round(features["currency_volatility"] / 0.1,  3),
        }

        contribs = {}
        for f in FEATURE_COLS:
            contribs[f] = {
                "normalised_value": norm[f],
                "importance":       round(importances.get(f, 0), 4),
                "contribution":     round(norm[f] * importances.get(f, 0), 5),
            }

        return contribs

    # ── Metadata accessors ─────────────────────────────────────────────────────

    @property
    def metrics(self) -> Dict:
        """Return test-set metrics for the loaded model."""
        for m in self._meta.get("metrics", []):
            if m["model"] == self._model_name:
                return m
        return {}

    @property
    def feature_importances(self) -> Dict[str, float]:
        return self._meta.get("feature_importances", {}).get(self._model_name, {})

    @property
    def model_name(self) -> str:
        return self._model_name

    @property
    def all_metrics(self) -> List[Dict]:
        return self._meta.get("metrics", [])

    def __repr__(self) -> str:
        m = self.metrics
        return (
            f"RiskScorer(model={self._model_name}, "
            f"R²={m.get('R2','?')}, RMSE={m.get('RMSE','?')})"
        )


# ── Singleton for API use ─────────────────────────────────────────────────────

_scorer: Optional[RiskScorer] = None

def get_scorer(artifacts_dir: str = "ml/risk_scoring/artifacts") -> RiskScorer:
    """Returns a cached RiskScorer instance (loaded once at startup)."""
    global _scorer
    if _scorer is None:
        _scorer = RiskScorer(artifacts_dir=artifacts_dir)
    return _scorer