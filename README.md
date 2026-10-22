# DATAMI — Kochi Crime Analytics & Prediction Platform

> **DATAMI**: **D**ata-mining **A**nalytics and **T**emporal **A**ssessment for **M**etropolitan **I**ntelligence  
> A college data-mining project engineered for the **Kochi City Police Commissionerate** (Kerala, India).

[![KTU S5 Syllabus PECST525](https://img.shields.io/badge/Syllabus-KTU%20S5%20PECST525-indigo.svg)](docs/ARCHITECTURE.md)
[![Data Provenance](https://img.shields.io/badge/Data%20Source-100%25%20Real%20Kerala%20Police-emerald.svg)](docs/DATA_SOURCES.md)
[![FastAPI Backend](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](docs/API_SPECIFICATION.md)
[![React TypeScript](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20Tailwind-blue.svg)](docs/ARCHITECTURE.md)
[![Leaflet Maps](https://img.shields.io/badge/Cartography-Leaflet%20%7C%20OSM-green.svg)](docs/ARCHITECTURE.md)

---

## 📚 Complete Project Documentation (`docs/`)

All comprehensive technical, architectural, methodological, and operational documentation is maintained in the [`docs/`](docs/) directory:

- 🏛️ **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — End-to-end system design, KDD data warehouse schema, multidimensional OLAP data cube model, and component architecture.
- 📋 **[docs/DATA_SOURCES.md](docs/DATA_SOURCES.md)** — Complete data provenance, official Kerala Police URLs, geocoded station coordinates verification, and schema definitions.
- 🔍 **[docs/DATA_QUALITY.md](docs/DATA_QUALITY.md)** — Data quality audit, zero-count policy vs missing values, and dataset completeness report.
- 🧠 **[docs/ML_METHODOLOGY.md](docs/ML_METHODOLOGY.md)** — Decision Tree (CART / Gini Index) induction, strict chronological train/test partitioning, evaluation metrics, confusion matrix, and baselines.
- 📡 **[docs/API_SPECIFICATION.md](docs/API_SPECIFICATION.md)** — REST API endpoint contract, query filters, and sample request/response payloads.
- 🚀 **[docs/RUNBOOK.md](docs/RUNBOOK.md)** — Step-by-step reproduction instructions: dependency installation, data ingestion, ML training, tests, and application launch.
- 📄 **[docs/S5-Data Mining Syllabus.pdf](docs/S5-Data%20Mining%20Syllabus.pdf)** — Official KTU university syllabus for Data Mining (Course Code: PECST525).

---

## 🎯 Academic Purpose & Syllabus Alignment (PECST525)

DATAMI is designed specifically to operationalize concepts taught in the **KTU S5 Data Mining Course (PECST525)**:

1. **Module 1 (Fundamentals & Warehousing)**: Knowledge Discovery in Databases (KDD) process, Multidimensional Data Models (Fact table: `crime_records`, Dimension tables: `stations`, `staff_strength`), and dynamic OLAP operations (Roll-up, Drill-down, Slice, Dice).
2. **Module 2 (Data Preprocessing)**: Data cleaning with strict differentiation between zero values and missing entries, concept hierarchy generation (District $\rightarrow$ Sub-Division $\rightarrow$ Station), and discretization of continuous crime volume into relative risk tiers.
3. **Module 3 (Classification)**: Decision Tree induction principle using Gini Impurity (CART algorithm), explainable decision paths ($\text{depth} \le 3$), strict chronological out-of-time test splitting (Train: 2016–2019, Test: 2020–2025), and evaluation via Accuracy, Precision, Recall, F1-Score, Confusion Matrix, and Zero-R/Persistence baselines.
4. **Module 4 (Spatial & Advanced Analytics)**: Automated web extraction of official registers and spatial cartography using Leaflet and OpenStreetMap.

---

## 🛡️ Strict Anti-Synthetic Data Guarantee

- **Zero Synthetic Records**: Every single crime statistic, station coordinate, and staffing register in DATAMI is real, traceable, and harvested directly from official portals of the **Kerala Police** (`https://ps.keralapolice.gov.in/` and `https://kochicity.keralapolice.gov.in/`).
- **Verified Coordinates**: All 37 police stations are mapped using coordinates directly embedded in official state police Leaflet markers.
- **Reporting Granularity**: Retains authentic annual granularity. Monthly or daily figures are never fabricated from annual totals.
- **Defensible Machine Learning**: Predicts relative station risk tiers (Higher vs Lower Relative Risk) based on historical volume. Does not fabricate fictional street-level prediction claims.

---

## ⚡ Quickstart Commands

### 1. Ingest Official Data & Train Model
```bash
# Ingest 37 stations & 14,000+ real records
python3 backend/scripts/ingest_data.py

# Train the explainable Decision Tree classifier
PYTHONPATH=backend python3 backend/app/ml/train.py
```

### 2. Run Backend API Server
```bash
PYTHONPATH=backend uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3. Run Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run Automated Tests
```bash
PYTHONPATH=backend pytest backend/tests/ -v
cd frontend && npm run build
```

For detailed operational guidance, always refer to **[docs/RUNBOOK.md](docs/RUNBOOK.md)**.
