
import argparse
import json
import os
import pickle
import time
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.preprocessing import StandardScaler


# ── Constants ─────────────────────────────────────────────────────────────────

FEATURE_COLS = [
    "supplier_reliability",
    "transport_delay_days",
    "geo_political_risk",
    "weather_risk",
    "inventory_level",
    "currency_volatility",
]
TARGET_COL = "risk_score"

RISK_BINS   = [0.0, 0.25, 0.50, 0.75, 1.01]
RISK_LABELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]


# ── Model definitions ──────────────────────────────────────────────────────────

MODEL_CONFIGS = {
    "ridge": {
        "class":  Ridge,
        "params": {"alpha": 10.0},  # Increased regularization to prevent overfitting
        "needs_scaling": True,
        "description": "Linear baseline — fast, interpretable",
    },
    "random_forest": {
        "class":  RandomForestRegressor,
        "params": {"n_estimators": 150, "max_depth": 8, "min_samples_leaf": 6, "random_state": 42, "n_jobs": -1},
        "needs_scaling": False,
        "description": "Ensemble of decision trees — handles non-linearities",
    },
    "gradient_boosting": {
        "class":  GradientBoostingRegressor,
        "params": {"n_estimators": 150, "learning_rate": 0.05, "max_depth": 4, "subsample": 0.8, "min_samples_leaf": 5, "random_state": 42},
        "needs_scaling": False,
        "description": "Sequential boosting — highest accuracy, production model",
    },
}


# ── Metrics helper ─────────────────────────────────────────────────────────────

def compute_metrics(y_true, y_pred, name: str) -> dict:
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    mae  = float(mean_absolute_error(y_true, y_pred))
    r2   = float(r2_score(y_true, y_pred))
    mape = float(np.mean(np.abs((y_true - y_pred) / np.clip(np.abs(y_true), 1e-6, None))) * 100)
    return {"model": name, "RMSE": round(rmse, 5), "MAE": round(mae, 5), "R2": round(r2, 5), "MAPE_pct": round(mape, 2)}


# ── Feature importance (works for tree models and Ridge) ──────────────────────

def get_feature_importance(model, feature_names: list) -> dict:
    if hasattr(model, "feature_importances_"):
        imps = model.feature_importances_
    elif hasattr(model, "coef_"):
        imps = np.abs(model.coef_)
        imps = imps / imps.sum()   # normalise
    else:
        imps = np.ones(len(feature_names)) / len(feature_names)
    return {f: round(float(imp), 5) for f, imp in zip(feature_names, imps)}


# ── Training pipeline ──────────────────────────────────────────────────────────

def load_data(data_path: str) -> tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """Load CSV and return (X_train, X_test, y_train, y_test)."""
    df = pd.read_csv(data_path)

    missing = [c for c in FEATURE_COLS + [TARGET_COL] if c not in df.columns]
    if missing:
        raise ValueError(f"Missing columns in data: {missing}")

    X = df[FEATURE_COLS].copy()
    y = df[TARGET_COL].copy()

    # If pre-split train.csv is given, load test.csv from same dir
    p = Path(data_path)
    test_path = p.parent / "test.csv"
    if p.name == "train.csv" and test_path.exists():
        df_test = pd.read_csv(test_path)
        X_test  = df_test[FEATURE_COLS]
        y_test  = df_test[TARGET_COL]
        print(f"   Using pre-split: {len(X)} train, {len(X_test)} test")
        return X, X_test, y, y_test

    # Otherwise split 80/20
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print(f"   Split 80/20: {len(X_train)} train, {len(X_test)} test")
    return X_train, X_test, y_train, y_test


def train_all(data_path: str, output_dir: str) -> dict:
    """
    Train all three models and save artifacts.
    Returns metadata dict with metrics and feature importances.
    """
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    print(f"\n── Loading data from {data_path}")
    X_train, X_test, y_train, y_test = load_data(data_path)

    print(f"   Features  : {FEATURE_COLS}")
    print(f"   Target    : {TARGET_COL}  (range {y_train.min():.3f}–{y_train.max():.3f})")

    # Shared scaler (for Ridge)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled  = scaler.transform(X_test)

    all_metrics      = []
    feature_imps     = {}
    cv_scores        = {}
    best_model_name  = None
    best_r2          = -np.inf
    trained_models   = {}

    for model_name, cfg in MODEL_CONFIGS.items():
        print(f"\n── Training {model_name} ({cfg['description']})")
        t0 = time.time()

        model = cfg["class"](**cfg["params"])
        Xtr = X_train_scaled if cfg["needs_scaling"] else X_train.values
        Xte = X_test_scaled  if cfg["needs_scaling"] else X_test.values

        # 5-fold cross-validation on training set
        cv = cross_val_score(model, Xtr, y_train, cv=5, scoring="r2", n_jobs=-1)
        cv_scores[model_name] = {"mean": round(float(cv.mean()), 4), "std": round(float(cv.std()), 4)}

        # Final fit on full training set
        model.fit(Xtr, y_train)
        preds = model.predict(Xte)

        elapsed = time.time() - t0
        m = compute_metrics(y_test.values, preds, model_name)
        all_metrics.append(m)
        feature_imps[model_name] = get_feature_importance(model, FEATURE_COLS)

        print(f"   R²={m['R2']:.4f}  RMSE={m['RMSE']:.5f}  MAE={m['MAE']:.5f}  "
              f"CV R²={cv.mean():.4f}±{cv.std():.4f}  ({elapsed:.1f}s)")

        if m["R2"] > best_r2:
            best_r2 = m["R2"]
            best_model_name = model_name

        trained_models[model_name] = {"model": model, "scaler": scaler if cfg["needs_scaling"] else None}

        # Save model pickle
        artifact = {
            "model": model,
            "scaler": scaler if cfg["needs_scaling"] else None,
            "feature_cols": FEATURE_COLS,
            "target_col": TARGET_COL,
            "risk_bins": RISK_BINS,
            "risk_labels": RISK_LABELS,
        }
        with open(output_path / f"{model_name}.pkl", "wb") as f:
            pickle.dump(artifact, f)
        print(f"   Saved → {output_path / f'{model_name}.pkl'}")

    # ── Save metadata JSON ─────────────────────────────────────────────────────
    metadata = {
        "trained_on":     str(Path(data_path).resolve()),
        "n_train":        int(len(X_train)),
        "n_test":         int(len(X_test)),
        "features":       FEATURE_COLS,
        "target":         TARGET_COL,
        "best_model":     best_model_name,
        "metrics":        all_metrics,
        "cv_scores":      cv_scores,
        "feature_importances": feature_imps,
    }

    meta_path = output_path / "metadata.json"
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\n── Training complete ──────────────────────────────────────────────")
    print(f"   Best model : {best_model_name}  (R²={best_r2:.4f})")
    print(f"   Metadata   → {meta_path}")

    # Print comparison table
    print(f"\n{'Model':20s}  {'R²':>8}  {'RMSE':>8}  {'MAE':>8}  {'MAPE%':>7}  {'CV R²':>12}")
    print("─" * 70)
    for m in sorted(all_metrics, key=lambda x: -x["R2"]):
        cv = cv_scores[m["model"]]
        marker = " ← best" if m["model"] == best_model_name else ""
        print(f"{m['model']:20s}  {m['R2']:8.4f}  {m['RMSE']:8.5f}  {m['MAE']:8.5f}  "
              f"{m['MAPE_pct']:7.2f}  {cv['mean']:.4f}±{cv['std']:.4f}{marker}")

    return metadata


# ── CLI ────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Train supply chain risk scoring models")
    parser.add_argument(
        "--data", type=str, default="data/train.csv",
        help="Path to training CSV (default: data/train.csv)"
    )
    parser.add_argument(
        "--output", type=str, default="ml/risk_scoring/artifacts",
        help="Output directory for model artifacts (default: ml/risk_scoring/artifacts)"
    )
    args = parser.parse_args()

    # Auto-generate data if not found
    if not Path(args.data).exists():
        fallback = "data/synthetic_supply_chain_data.csv"
        if Path(fallback).exists():
            print(f"⚠  {args.data} not found, falling back to {fallback}")
            args.data = fallback
        else:
            print(f"⚠  Data not found at {args.data}. Generating now...")
            import subprocess, sys
            subprocess.run([sys.executable, "src/data_processing/generate_synthetic_data.py"], check=True)
            args.data = "data/train.csv"

    train_all(data_path=args.data, output_dir=args.output)


if __name__ == "__main__":
    main()