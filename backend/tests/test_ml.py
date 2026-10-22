"""
DATAMI - Machine Learning Unit Tests
Verifies Decision Tree induction, chronological splitting, and absence of data leakage.
"""

import pytest
from app.ml.risk_model import train_and_evaluate, predict_future_station_risk

def test_model_training_and_chronological_split():
    eval_res = train_and_evaluate(split_year=2020)
    assert eval_res["status"] == "success"
    assert eval_res["algorithm"] == "Decision Tree Classifier (CART / Gini Index)"
    
    # Verify no chronological leakage: train max year < test min year
    summary = eval_res["dataset_summary"]
    train_years = [int(y) for y in summary["train_years"].split("–")]
    test_years = [int(y) for y in summary["test_years"].split("–")]
    assert max(train_years) < min(test_years)

    # Verify metrics structure
    metrics = eval_res["metrics"]
    assert 0.0 <= metrics["accuracy"] <= 1.0
    assert 0.0 <= metrics["precision"] <= 1.0
    assert 0.0 <= metrics["recall"] <= 1.0
    assert 0.0 <= metrics["f1_score"] <= 1.0
    assert len(metrics["confusion_matrix"]) == 2

    # Verify baselines
    assert "zero_r_majority" in eval_res["baselines"]
    assert "persistence_lag1" in eval_res["baselines"]

def test_station_risk_predictions():
    pred_res = predict_future_station_risk()
    assert "predictions" in pred_res
    assert pred_res["total_stations"] >= 25
    assert pred_res["higher_risk_count"] + pred_res["lower_risk_count"] > 0

    # Test single station prediction
    ekm_pred = predict_future_station_risk(station_id="ernakulamcentral")
    assert len(ekm_pred["predictions"]) == 1
    p = ekm_pred["predictions"][0]
    assert p["station_id"] == "ernakulamcentral"
    assert p["risk_tier"] in ["higher", "lower", "insufficient_data"]
    assert p["confidence"] is not None
    assert "decision_rationale" in p
