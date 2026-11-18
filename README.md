# Pune Transit Planner

An interactive Pune transit planner. A React app asks a Python API for trip options. Bus speeds come from bundled samples when a direct route exists, and from a scikit-learn random forest otherwise.

Speeds, times, and fares are estimates from sample data. They are not live transit, live weather, or provider quotes. The cross-validation numbers describe those samples only.

## Layout

```text
TransitPlanner/
├── frontend/                 # Vite + React UI
└── backend/
    ├── app/                  # FastAPI, trip planner, random forest
    ├── data/samples.json     # Bundled places, speeds, geometry, weather
    ├── data/README.md        # Sample provenance and evaluation limits
    └── tests/
```

## Run locally

Use two terminals.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

```bash
cd frontend
npm install
npm run dev
```

Open http://127.0.0.1:5173. The dev server proxies `/api` to the API on port 8000.

On an existing checkout the virtualenv may already be at `backend/.venv`. Start the API with `backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000`.

## Tests

```bash
cd backend
.venv/bin/pytest
```

## Model

The forest trains at startup on 42 area-by-window bus-speed rows. Features are the time of day and the trip midpoint. Direct historical route samples still take priority over the prediction. Details and the limits of the sample set are in [backend/data/README.md](backend/data/README.md).
