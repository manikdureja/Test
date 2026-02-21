# src/data_processing/generate_synthetic_data.py

import pandas as pd
import numpy as np
from pathlib import Path

np.random.seed(42)

N = 1000

data = {
    "supplier_reliability": np.random.uniform(0.6, 1.0, N),
    "transport_delay_days": np.random.randint(0, 15, N),
    "geo_political_risk": np.random.uniform(0, 1, N),
    "weather_risk": np.random.uniform(0, 1, N),
    "inventory_level": np.random.randint(50, 500, N),
    "currency_volatility": np.random.uniform(0, 0.1, N),
}

df = pd.DataFrame(data)

# Simple risk score (can improve later)
df["risk_score"] = (
    0.3 * (1 - df["supplier_reliability"]) +
    0.2 * (df["transport_delay_days"] / 15) +
    0.2 * df["geo_political_risk"] +
    0.1 * df["weather_risk"] +
    0.1 * (1 - df["inventory_level"] / 500) +
    0.1 * (df["currency_volatility"] / 0.1)
)

# Save supply chain risk data
output_dir = Path(__file__).parent.parent / "data"
output_dir.mkdir(exist_ok=True)

df.to_csv(output_dir / "synthetic_supply_chain_data.csv", index=False)

# ─── Commodity price time series (for Price Forecast) ────────────────────────────
COMMODITIES = [
    ("Crude Oil", "Energy", "$/bbl"),
    ("Coal", "Energy", "$/mt"),
    ("Natural Gas", "Energy", "$/mmbtu"),
    ("Copper", "Metals", "$/lb"),
    ("Aluminum", "Metals", "$/mt"),
    ("Zinc", "Metals", "$/mt"),
    ("Gold", "Metals", "$/oz"),
    ("Wheat", "Agriculture", "$/mt"),
    ("Corn", "Agriculture", "$/mt"),
    ("Coffee", "Agriculture", "¢/lb"),
    ("Cotton", "Agriculture", "¢/lb"),
    ("Sugar", "Agriculture", "$/lb"),
    ("Steel", "Industrial", "$/mt"),
    ("Fertilizer", "Industrial", "$/mt"),
    ("Rubber", "Industrial", "$/mt"),
]

np.random.seed(123)
base_year = 1990
n_years = 35
years = list(range(base_year, base_year + n_years))

rows = []
for name, category, unit in COMMODITIES:
    # Base price with some randomness
    base = np.random.uniform(20, 800) if "¢" in unit else np.random.uniform(0.5, 120)
    trend = np.random.uniform(-0.02, 0.06)
    vol = np.random.uniform(0.05, 0.25)

    prices = [base]
    for t in range(1, n_years):
        change = trend + np.random.normal(0, vol)
        prices.append(max(0.1, prices[-1] * (1 + change)))
    for yr, p in zip(years, prices):
        rows.append({"commodity": name, "category": category, "unit": unit, "year": yr, "price": round(p, 4)})

df_prices = pd.DataFrame(rows)
df_prices.to_csv(output_dir / "synthetic_commodity_prices.csv", index=False)

print("✅ Synthetic supply chain data generated at data/synthetic_supply_chain_data.csv")
print("✅ Synthetic commodity prices generated at data/synthetic_commodity_prices.csv")