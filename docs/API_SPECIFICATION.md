# DATAMI REST API Specification

The DATAMI backend is powered by **FastAPI** and provides documented RESTful endpoints for querying historical crime figures, geospatial coordinates, OLAP aggregations, and Decision Tree risk predictions.

- **Base URL**: `http://127.0.0.1:8001/api`
- **Interactive Swagger Documentation**: `http://127.0.0.1:8001/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8001/redoc`

---

## 1. System & Metadata Endpoints

### `GET /api/health`
Checks server status, uptime, and database connectivity.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "DATAMI Crime Analytics & Prediction Platform",
  "version": "1.0.0"
}
```

---

### `GET /api/metadata`
Returns global application metadata, filter options for UI dropdowns, and dataset provenance statements.

**Response (200 OK):**
```json
{
  "project_name": "DATAMI",
  "acronym_meaning": "Data-mining Analytics and Temporal Assessment for Municipal Intelligence",
  "syllabus_alignment": "KTU S5 Data Mining (PECST525)",
  "geographic_focus": "Kochi City Police, Kerala, India",
  "total_police_stations": 37,
  "kochi_stations_count": 29,
  "total_real_records": 14262,
  "reporting_period": "2014–2022",
  "filter_options": {
    "districts": ["Ernakulam", "Ernakulam Rural", "Railways"],
    "divisions": ["Ernakulam Sub-Division", "Mattancherry Sub-Division", "Thrikkakara Sub-Division", "Aluva Sub-Division", ...],
    "years": [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014]
  }
}
```

---

## 2. Police Station Endpoints

### `GET /api/stations`
Lists all ingested police stations with verified Leaflet geocoordinates, jurisdiction text, SHO contacts, and cumulative recorded cases.

**Query Parameters:**
- `district` *(optional, string)*: Filter by district (e.g. `Ernakulam`).
- `division` *(optional, string)*: Filter by sub-division (e.g. `Ernakulam Sub-Division`).

**Sample Response (200 OK):**
```json
[
  {
    "id": "ernakulamcentral",
    "name": "Ernakulam Central",
    "district": "Ernakulam",
    "division": "Ernakulam Sub-Division",
    "latitude": 9.9871,
    "longitude": 76.27595,
    "address": "Ernakulam Central Police Station, Kochi, Kerala",
    "jurisdiction": "Jurisdiction of Ernakulam Central Police Station",
    "sho_name": "ANISH JOY",
    "sho_phone": "9497987103",
    "sanctioned_staff": 172,
    "existing_staff": 159,
    "vacancy_staff": 13,
    "min_year": 2014,
    "max_year": 2022,
    "total_cases_recorded": 17992
  }
]
```

---

### `GET /api/crimes/station/{station_id}`
Returns a full profile for a single police station, including yearly historical totals (2014–2022), top IPC crime heads, top SLL enactments, staff breakdown, and Decision Tree risk classification.

**Path Parameter:**
- `station_id` *(string, required)*: Unique slug ID (e.g. `ernakulamcentral`, `thrikkakara`, `fortkochi`).

**Sample Response (200 OK):**
```json
{
  "metadata": {
    "id": "ernakulamcentral",
    "name": "Ernakulam Central",
    "district": "Ernakulam",
    "latitude": 9.9871,
    "longitude": 76.27595,
    "staff_breakdown": [
      { "rank": "Civil Police Officer", "sanctioned": 111, "existing": 111, "vacancy": 0 },
      { "rank": "Senior Civil Police Officer", "sanctioned": 35, "existing": 30, "vacancy": 5 }
    ]
  },
  "yearly_history": [
    { "year": 2014, "total_cases": 2613, "ipc_cases": 885, "sll_cases": 1728 },
    { "year": 2022, "total_cases": 1939, "ipc_cases": 926, "sll_cases": 1013 }
  ],
  "top_ipc_crime_heads": [
    { "crime_head": "Theft", "total_count": 283 },
    { "crime_head": "Hurt", "total_count": 240 }
  ],
  "risk_prediction": {
    "risk_label": "Higher Relative Risk",
    "risk_tier": "higher",
    "confidence": 0.85,
    "decision_rationale": "Preceding year volume (1939) exceeded metropolitan median (824)."
  }
}
```

---

## 3. Crime Analytics & OLAP Endpoints

### `GET /api/crimes/summary`
Calculates high-level KPI metrics across specified dimensions.

**Query Parameters:**
- `year` *(optional, int)*: Filter to single year.
- `district` *(optional, string)*: Filter to district.
- `station_id` *(optional, string)*: Filter to station.
- `crime_category` *(optional, string)*: `ALL_TOTAL`, `IPC_TOTAL`, or `SLL_TOTAL`.

**Sample Response (200 OK):**
```json
{
  "total_registered_cases": 58240,
  "ipc_cases": 18450,
  "sll_cases": 39790,
  "stations_represented": 29,
  "most_recent_year": 2022,
  "highest_station": {
    "station_id": "ernakulamcentral",
    "station_name": "Ernakulam Central",
    "recorded_cases": 17992,
    "caveat": "High raw volume may reflect high transit population and commercial density."
  }
}
```

---

### `GET /api/crimes/trends`
Returns annual time series aggregated across all or filtered police stations.

**Sample Response (200 OK):**
```json
[
  { "year": 2014, "total_cases": 28410, "ipc_cases": 8940, "sll_cases": 19470, "stations_reporting": 29 },
  { "year": 2015, "total_cases": 27850, "ipc_cases": 8810, "sll_cases": 19040, "stations_reporting": 29 }
]
```

---

### `GET /api/crimes/categories`
Returns the breakdown of specific crime heads (e.g. Murder, Theft, Burglary, NDPS Act).

**Query Parameters:**
- `category_type` *(string)*: `IPC` (default) or `SLL`.

**Sample Response (200 OK):**
```json
[
  { "crime_head": "Theft", "case_count": 4820, "percentage": 24.1 },
  { "crime_head": "Hurt", "case_count": 3910, "percentage": 19.5 },
  { "crime_head": "Burglary", "case_count": 1240, "percentage": 6.2 }
]
```

---

## 4. Machine Learning & Prediction Endpoints

### `GET /api/predictions/risk`
Generates upcoming reporting period predictions for all stations using the explainable Decision Tree classifier.

**Sample Response (200 OK):**
```json
{
  "prediction_period": "Upcoming Reporting Period",
  "model_used": "Decision Tree Classifier (CART)",
  "syllabus_concept": "Module 3: Decision Tree Induction & Explainable Risk Categorization",
  "total_stations": 37,
  "higher_risk_count": 14,
  "lower_risk_count": 23,
  "predictions": [
    {
      "station_id": "ernakulamcentral",
      "station_name": "Ernakulam Central",
      "risk_label": "Higher Relative Risk",
      "risk_tier": "higher",
      "confidence": 0.85,
      "features_used": {
        "lag1_cases": 1939,
        "lag2_cases": 662,
        "rolling_avg": 1300.5,
        "trend_rate_pct": 192.6,
        "sll_ratio_pct": 52.2
      },
      "decision_rationale": "Preceding year volume (1939) exceeded metropolitan median (824). Upward registration velocity (+192.6% over previous year)."
    }
  ]
}
```

---

### `GET /api/model/evaluation`
Returns complete evaluation metrics from the chronological test set (Accuracy, Precision, Recall, F1, Confusion Matrix, Baselines, and Inducted Decision Rules).

---

### `GET /api/workload`
Returns incident-volume vs active staffing ratio analysis with prominent caveats (Requirement 3E).
