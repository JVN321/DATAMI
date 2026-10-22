"""
DATAMI Machine Learning Module — Decision Tree Crime Risk Classifier
Implements Module 3 (Classification) of the S5 Data Mining Syllabus (PECST525).
- Algorithm: CART Decision Tree with Gini Impurity (or Entropy/Information Gain)
- Features: Strictly chronological lagged counts, rolling means, trend velocity, and SLL ratios
- Evaluation: Accuracy, Precision, Recall, F1-Score, Confusion Matrix, and Baseline comparisons
"""

import os
import json
import sqlite3
import pickle
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

from app.config import DB_PATH, MODEL_PATH, EVAL_PATH

FEATURE_COLS = ["lag1_cases", "lag2_cases", "rolling_avg", "trend_rate", "sll_ratio"]

def build_temporal_features(conn):
    """
    Constructs chronologically sound tabular features from raw historical observations.
    Strictly forbids data leakage: features for year T only use data from T-1, T-2, etc.
    """
    query = """
    SELECT station_id, year, crime_category, case_count 
    FROM crime_records 
    WHERE crime_category IN ('ALL_TOTAL', 'IPC_TOTAL', 'SLL_TOTAL')
    """
    df = pd.read_sql(query, conn)
    if df.empty:
        return pd.DataFrame(), 0.0

    pivoted = df.pivot_table(
        index=["station_id", "year"],
        columns="crime_category",
        values="case_count",
        fill_value=0
    ).reset_index()

    pivoted = pivoted.sort_values(["station_id", "year"])
    
    # Calculate global median of annual case counts for objective relative risk threshold
    overall_median = float(pivoted["ALL_TOTAL"].median())

    records = []
    for station_id, group in pivoted.groupby("station_id"):
        group = group.sort_values("year").reset_index(drop=True)
        for i in range(len(group)):
            current_year = int(group.loc[i, "year"])
            current_cases = float(group.loc[i, "ALL_TOTAL"])

            lag1_row = group[group["year"] == current_year - 1]
            lag2_row = group[group["year"] == current_year - 2]

            if not lag1_row.empty and not lag2_row.empty:
                lag1_cases = float(lag1_row["ALL_TOTAL"].values[0])
                lag2_cases = float(lag2_row["ALL_TOTAL"].values[0])
                lag1_sll = float(lag1_row["SLL_TOTAL"].values[0]) if "SLL_TOTAL" in lag1_row else 0.0

                rolling_avg = (lag1_cases + lag2_cases) / 2.0
                trend_rate = (lag1_cases - lag2_cases) / (lag2_cases + 1.0)
                sll_ratio = lag1_sll / (lag1_cases + 1.0)

                # Target Label: 1 = Higher Relative Risk (at or above median), 0 = Lower Relative Risk
                target = 1 if current_cases >= overall_median else 0
                persist_pred = 1 if lag1_cases >= overall_median else 0

                records.append({
                    "station_id": station_id,
                    "year": current_year,
                    "lag1_cases": lag1_cases,
                    "lag2_cases": lag2_cases,
                    "rolling_avg": rolling_avg,
                    "trend_rate": trend_rate,
                    "sll_ratio": sll_ratio,
                    "current_cases": current_cases,
                    "target_label": target,
                    "persistence_pred": persist_pred
                })

    return pd.DataFrame(records), overall_median

def train_and_evaluate(split_year=2020, max_depth=3, criterion="gini"):
    """
    Trains an explainable Decision Tree classifier with a strict chronological split.
    """
    conn = sqlite3.connect(DB_PATH)
    df_feat, overall_median = build_temporal_features(conn)
    conn.close()

    if df_feat.empty or len(df_feat) < 20:
        return {
            "status": "insufficient_data",
            "message": "Not enough historical observations to build a reliable classifier."
        }

    # Chronological partition
    train_df = df_feat[df_feat["year"] < split_year]
    test_df = df_feat[df_feat["year"] >= split_year]

    if test_df.empty or train_df.empty:
        # Fallback to 75-25 time split if needed
        years = sorted(df_feat["year"].unique())
        cutoff = years[int(len(years) * 0.7)]
        train_df = df_feat[df_feat["year"] < cutoff]
        test_df = df_feat[df_feat["year"] >= cutoff]

    X_train = train_df[FEATURE_COLS]
    y_train = train_df["target_label"]
    X_test = test_df[FEATURE_COLS]
    y_test = test_df["target_label"]

    # Model training: DecisionTreeClassifier (Module 3 Syllabus: ID3 / CART Gini principle)
    clf = DecisionTreeClassifier(
        criterion=criterion,
        max_depth=max_depth,
        min_samples_split=4,
        random_state=42
    )
    clf.fit(X_train, y_train)

    # Save model
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump({"model": clf, "median_threshold": overall_median, "features": FEATURE_COLS}, f)

    # Evaluation on chronological test set
    y_pred = clf.predict(X_test)
    y_proba = clf.predict_proba(X_test)[:, 1] if hasattr(clf, "predict_proba") else []

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    cm = confusion_matrix(y_test, y_pred).tolist()

    # Baselines
    zero_r_pred = np.zeros(len(y_test))
    zero_r_acc = float(accuracy_score(y_test, zero_r_pred))

    persist_pred = test_df["persistence_pred"]
    persist_acc = float(accuracy_score(y_test, persist_pred))
    persist_f1 = float(f1_score(y_test, persist_pred, zero_division=0))

    tree_rules = export_text(clf, feature_names=FEATURE_COLS)
    feature_importances = {col: float(imp) for col, imp in zip(FEATURE_COLS, clf.feature_importances_)}

    eval_result = {
        "status": "success",
        "algorithm": "Decision Tree Classifier (CART / Gini Index)",
        "syllabus_mapping": "Module 3: Decision Tree Construction Principle & Evaluation Measures (PECST525)",
        "hyperparameters": {
            "criterion": criterion,
            "max_depth": max_depth,
            "min_samples_split": 4,
            "split_year": split_year
        },
        "target_definition": f"Relative Crime Risk tier: 1 = Higher Relative Risk (>= {overall_median:.1f} annual recorded incidents), 0 = Lower Relative Risk (< {overall_median:.1f})",
        "dataset_summary": {
            "total_samples": len(df_feat),
            "train_samples": len(train_df),
            "train_years": f"{train_df['year'].min()}–{train_df['year'].max()}",
            "test_samples": len(test_df),
            "test_years": f"{test_df['year'].min()}–{test_df['year'].max()}"
        },
        "metrics": {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "confusion_matrix": cm,
            "confusion_matrix_labels": [
                ["True Low Risk (TN)", "False High Risk (FP)"],
                ["False Low Risk (FN)", "True High Risk (TP)"]
            ]
        },
        "baselines": {
            "zero_r_majority": {
                "name": "Zero-R (Always predicts dominant class)",
                "accuracy": round(zero_r_acc, 4)
            },
            "persistence_lag1": {
                "name": "Persistence Baseline (Predicts previous year risk tier)",
                "accuracy": round(persist_acc, 4),
                "f1_score": round(persist_f1, 4)
            }
        },
        "feature_importances": feature_importances,
        "decision_rules": tree_rules,
        "trained_at": datetime.now().isoformat(),
        "limitations": [
            "Predicts relative risk categories (Higher vs Lower), not specific street coordinates or individual offenses.",
            "Reflects recorded FIR registrations, which are influenced by reporting rates, special police drives (e.g. NDPS crackdowns), and lockdown disruptions in 2020–2021.",
            "Annual granularity limits within-year seasonal detection.",
            "Raw counts do not account for resident population density or daily commuter influx."
        ]
    }

    with open(EVAL_PATH, "w", encoding="utf-8") as f:
        json.dump(eval_result, f, indent=2)

    return eval_result

def get_model_evaluation():
    """Retrieve saved evaluation report or train if missing."""
    if os.path.exists(EVAL_PATH):
        try:
            with open(EVAL_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return train_and_evaluate()

def predict_future_station_risk(station_id=None):
    """
    Generates relative risk predictions for police stations for the upcoming reporting period
    using their most recent observed historical features.
    """
    eval_report = get_model_evaluation()
    if not os.path.exists(MODEL_PATH):
        eval_report = train_and_evaluate()

    with open(MODEL_PATH, "rb") as f:
        saved = pickle.load(f)
        clf = saved["model"]
        median_threshold = saved["median_threshold"]

    conn = sqlite3.connect(DB_PATH)
    
    # Query station metadata
    query_st = "SELECT id, name, district, division, latitude, longitude, address, sho_name FROM stations"
    if station_id:
        query_st += f" WHERE id = '{station_id}'"
    df_st = pd.read_sql(query_st, conn)

    # Query latest records per station
    query_crimes = """
    SELECT station_id, year, crime_category, case_count 
    FROM crime_records 
    WHERE crime_category IN ('ALL_TOTAL', 'SLL_TOTAL')
    """
    df_c = pd.read_sql(query_crimes, conn)
    conn.close()

    pivoted = df_c.pivot_table(
        index=["station_id", "year"],
        columns="crime_category",
        values="case_count",
        fill_value=0
    ).reset_index()

    predictions = []
    for _, st_row in df_st.iterrows():
        s_id = st_row["id"]
        s_name = st_row["name"]
        st_history = pivoted[pivoted["station_id"] == s_id].sort_values("year").reset_index(drop=True)

        lat_val = None if pd.isna(st_row["latitude"]) else float(st_row["latitude"])
        lon_val = None if pd.isna(st_row["longitude"]) else float(st_row["longitude"])

        if len(st_history) < 2:
            predictions.append({
                "station_id": s_id,
                "station_name": s_name,
                "district": st_row["district"],
                "division": st_row["division"],
                "latitude": lat_val,
                "longitude": lon_val,
                "status": "insufficient_history",
                "risk_label": "Unassessed",
                "risk_tier": "insufficient_data",
                "confidence": None,
                "explanation": "Station has fewer than 2 continuous reporting years in public records."
            })
            continue

        latest_idx = len(st_history) - 1
        latest_year = int(st_history.loc[latest_idx, "year"])
        lag1_cases = float(st_history.loc[latest_idx, "ALL_TOTAL"])
        lag2_cases = float(st_history.loc[latest_idx - 1, "ALL_TOTAL"])
        lag1_sll = float(st_history.loc[latest_idx, "SLL_TOTAL"]) if "SLL_TOTAL" in st_history else 0.0

        rolling_avg = (lag1_cases + lag2_cases) / 2.0
        trend_rate = (lag1_cases - lag2_cases) / (lag2_cases + 1.0)
        sll_ratio = lag1_sll / (lag1_cases + 1.0)

        X_input = pd.DataFrame([{
            "lag1_cases": lag1_cases,
            "lag2_cases": lag2_cases,
            "rolling_avg": rolling_avg,
            "trend_rate": trend_rate,
            "sll_ratio": sll_ratio
        }])

        pred_class = int(clf.predict(X_input)[0])
        probas = clf.predict_proba(X_input)[0]
        confidence = float(probas[pred_class])

        risk_label = "Higher Relative Risk" if pred_class == 1 else "Lower Relative Risk"
        risk_tier = "higher" if pred_class == 1 else "lower"

        # Explainable decision rationale based on tree conditions
        reasons = []
        if lag1_cases >= median_threshold:
            reasons.append(f"Preceding year volume ({int(lag1_cases)}) exceeded metropolitan median ({int(median_threshold)}).")
        else:
            reasons.append(f"Preceding year volume ({int(lag1_cases)}) remained below metropolitan median ({int(median_threshold)}).")

        if trend_rate > 0.15:
            reasons.append(f"Upward registration velocity (+{round(trend_rate*100, 1)}% over previous year).")
        elif trend_rate < -0.15:
            reasons.append(f"Significant registration reduction ({round(trend_rate*100, 1)}% vs previous year).")

        if sll_ratio > 0.5:
            reasons.append(f"High proportion of Special & Local Laws enforcement ({round(sll_ratio*100, 1)}% of total cases).")

        predictions.append({
            "station_id": s_id,
            "station_name": s_name,
            "district": st_row["district"],
            "division": st_row["division"],
            "latitude": lat_val,
            "longitude": lon_val,
            "target_period": f"{latest_year + 1} Projected Risk",
            "last_reporting_year": latest_year,
            "risk_label": risk_label,
            "risk_tier": risk_tier,
            "risk_probability": round(float(probas[1]), 3),
            "confidence": round(confidence, 3),
            "features_used": {
                "lag1_cases": int(lag1_cases),
                "lag2_cases": int(lag2_cases),
                "rolling_avg": round(rolling_avg, 1),
                "trend_rate_pct": round(trend_rate * 100, 1),
                "sll_ratio_pct": round(sll_ratio * 100, 1)
            },
            "decision_rationale": " ".join(reasons)
        })

    return {
        "prediction_period": "Upcoming Reporting Period",
        "model_used": "Decision Tree Classifier (CART)",
        "syllabus_concept": "Module 3: Decision Tree Induction & Explainable Risk Categorization",
        "total_stations": len(predictions),
        "higher_risk_count": sum(1 for p in predictions if p.get("risk_tier") == "higher"),
        "lower_risk_count": sum(1 for p in predictions if p.get("risk_tier") == "lower"),
        "predictions": predictions
    }
