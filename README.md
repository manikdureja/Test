# Trade IQ (Hackathon MVP)

A Bloomberg-terminal-inspired dashboard for **small import/export businesses** and **solo traders**.

## What it shows
- Deal dashboard with key KPIs (exposure, risk, margin)
- Risk-focused deal table with filter controls
- FX monitor and geopolitical/risk feed
- Lightweight 3-month sales forecast projection

## Run locally
Because this is a static frontend prototype, you can open `index.html` directly in a browser.

Optional local server:
```bash
python3 -m http.server 4173
```
Then visit: `http://localhost:4173`

## Hackathon notes
- Built for 24-hour demo speed
- Uses mock data and deterministic formulas for risk and forecasting visuals
- Ready to extend with real APIs (shipping, FX, customs, credit risk)
