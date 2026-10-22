"""
DATAMI - Backend API Integration Tests
Tests all endpoints using FastAPI TestClient to guarantee correctness.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

def test_metadata():
    res = client.get("/api/metadata")
    assert res.status_code == 200
    data = res.json()
    assert data["project_name"] == "DATAMI"
    assert data["total_police_stations"] >= 25
    assert "Ernakulam" in data["filter_options"]["districts"]

def test_stations_list():
    res = client.get("/api/stations")
    assert res.status_code == 200
    stations = res.json()
    assert isinstance(stations, list)
    assert len(stations) >= 25
    # Verify Ernakulam Central is present with coordinates
    ekm_central = next((s for s in stations if s["id"] == "ernakulamcentral"), None)
    assert ekm_central is not None
    assert ekm_central["latitude"] is not None
    assert ekm_central["longitude"] is not None

def test_crime_summary():
    res = client.get("/api/crimes/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["total_registered_cases"] > 0
    assert data["stations_represented"] >= 25
    assert data["highest_station"] is not None

def test_crime_trends():
    res = client.get("/api/crimes/trends")
    assert res.status_code == 200
    trends = res.json()
    assert isinstance(trends, list)
    assert len(trends) > 5
    first = trends[0]
    assert "year" in first
    assert "total_cases" in first

def test_crime_categories():
    res = client.get("/api/crimes/categories?category_type=IPC")
    assert res.status_code == 200
    cats = res.json()
    assert isinstance(cats, list)
    assert len(cats) > 0
    assert any("Theft" in c["crime_head"] or "Theft" == c["crime_head"] for c in cats)

def test_station_detail():
    res = client.get("/api/crimes/station/ernakulamcentral")
    assert res.status_code == 200
    data = res.json()
    assert data["metadata"]["name"] == "Ernakulam Central"
    assert len(data["yearly_history"]) > 5
    assert data["risk_prediction"] is not None

def test_station_detail_not_found():
    res = client.get("/api/crimes/station/nonexistent_ps")
    assert res.status_code == 404

def test_risk_predictions():
    res = client.get("/api/predictions/risk")
    assert res.status_code == 200
    data = res.json()
    assert "predictions" in data
    assert len(data["predictions"]) >= 25
    assert "higher_risk_count" in data
    assert "lower_risk_count" in data

def test_model_evaluation():
    res = client.get("/api/model/evaluation")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "metrics" in data
    assert "accuracy" in data["metrics"]
    assert "confusion_matrix" in data["metrics"]
    assert "baselines" in data

def test_workload_analysis():
    res = client.get("/api/workload")
    assert res.status_code == 200
    workload = res.json()
    assert isinstance(workload, list)
    assert len(workload) > 0
    assert "cases_per_active_officer" in workload[0]
