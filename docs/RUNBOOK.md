# DATAMI Runbook — Operational & Reproduction Guide

This runbook provides step-by-step instructions to set up, ingest data, train the machine learning model, run tests, and launch both the backend API and frontend dashboard for **DATAMI** (**D**ata-mining **A**nalytics and **T**emporal **A**ssessment for **M**etropolitan **I**ntelligence).

---

## 1. Prerequisites

- **Python**: Version 3.12 or newer (`python3 --version`)
- **Node.js**: Version 18.0 or newer (`node -v`)
- **Package Managers**: `pip` and `npm`

---

## 2. Backend Environment Setup

From the repository root directory (`/devdrive/github/college/class/datamininig/DATAMI`):

### A. Install Python Dependencies
```bash
pip install -r backend/requirements.txt
```

### B. Reproducible Real Data Ingestion
This command downloads official crime tables, police station coordinates, and staffing registers directly from Kerala Police portals (`ps.keralapolice.gov.in` and `kochicity.keralapolice.gov.in`):
```bash
python3 backend/scripts/ingest_data.py
```
*Output: Populates `backend/app/data/datami_crime.db`, saves raw HTML snapshots in `backend/app/data/raw/`, and exports normalized CSVs to `backend/app/data/processed/`.*

### C. Train the Decision Tree Classifier
This command trains the CART Decision Tree on historical observations (Train: 2016–2019) and evaluates it chronologically (Test: 2020–2025):
```bash
PYTHONPATH=backend python3 backend/app/ml/train.py
```
*Output: Evaluates Accuracy, Precision, Recall, F1, Confusion Matrix, and saves model to `backend/app/ml/saved_models/risk_decision_tree.pkl`.*

### D. Run the FastAPI Backend Server
Launch the FastAPI development server on port 8000:
```bash
PYTHONPATH=backend uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```
- API Root: `http://127.0.0.1:8001/`
- Interactive Swagger UI: `http://127.0.0.1:8001/docs`
- Health Endpoint: `http://127.0.0.1:8001/api/health`

---

## 3. Frontend Setup & Launch

From the repository root directory:

### A. Install Node Dependencies
```bash
cd frontend
npm install
```

### B. Launch Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your web browser. The frontend automatically proxies requests to `http://127.0.0.1:8000`.

### C. Build Production Bundle
```bash
npm run build
```
Generates production-optimized static assets in `frontend/dist/`.

---

## 4. Automated Verification & Test Suite

Run all automated test suites to verify backend endpoints, data integrity, and machine learning formulation:

### Run Backend API Integration Tests
```bash
PYTHONPATH=backend pytest backend/tests/test_api.py -v
```

### Run Machine Learning Validation Tests
```bash
PYTHONPATH=backend pytest backend/tests/test_ml.py -v
```

### Run Full Test Suite
```bash
PYTHONPATH=backend pytest backend/tests/ -v
```

---

## 5. Directory & File Reference

| File / Directory | Purpose |
|---|---|
| `backend/app/main.py` | FastAPI application entrypoint with CORS and route mounting |
| `backend/app/api/routes.py` | REST API routes for metadata, stations, crimes, and predictions |
| `backend/app/services/crime_service.py` | OLAP multidimensional aggregation logic |
| `backend/app/services/station_service.py` | Police station directory and coordinate service |
| `backend/app/ml/risk_model.py` | Decision Tree classifier, lagged feature engineering, evaluation |
| `backend/app/ml/train.py` | Standalone ML training script |
| `backend/scripts/ingest_data.py` | Automated data scraper & normalizer |
| `backend/app/data/datami_crime.db` | SQLite database storing all normalized tables |
| `backend/app/data/processed/` | Clean CSV exports of stations, crimes, and staff |
| `frontend/src/pages/` | React pages: Overview, CrimeMap, StationDetail, RiskPrediction, Workload, DataSources |
| `docs/` | Comprehensive technical and academic documentation |

---

## 6. Troubleshooting

- **Database not found**: Run `python3 backend/scripts/ingest_data.py` to regenerate `datami_crime.db`.
- **CORS issues**: FastAPI CORS middleware is enabled for all origins in development. Verify the backend is listening on port 8000.
- **Port 8000 in use**: Run `fuser -k 8000/tcp` or start uvicorn with `--port 8001` and update `VITE_API_BASE_URL` in `frontend/.env`.
