"""
DATAMI - Standalone Model Training Script
Trains the Decision Tree classifier using strictly historical crime records.
Generates evaluation metrics and saves model artifacts.
"""

import sys
import json
from app.ml.risk_model import train_and_evaluate

def main():
    print("=" * 65)
    print("DATAMI: Training Decision Tree Crime Risk Classifier")
    print("Alignment: KTU S5 Data Mining (PECST525) Module 3")
    print("=" * 65)
    
    result = train_and_evaluate()
    
    if result.get("status") == "success":
        print("\n[SUCCESS] Model training completed successfully.")
        print(f"Target Definition: {result['target_definition']}")
        print(f"Chronological Split: Train ({result['dataset_summary']['train_years']}) -> Test ({result['dataset_summary']['test_years']})")
        print("\n--- Test Evaluation Metrics ---")
        print(f"Accuracy:  {result['metrics']['accuracy'] * 100:.2f}%")
        print(f"Precision: {result['metrics']['precision'] * 100:.2f}%")
        print(f"Recall:    {result['metrics']['recall'] * 100:.2f}%")
        print(f"F1-Score:  {result['metrics']['f1_score'] * 100:.2f}%")
        print(f"Confusion Matrix: {result['metrics']['confusion_matrix']}")
        print("\n--- Baselines Comparison ---")
        print(f"Zero-R (Majority) Accuracy: {result['baselines']['zero_r_majority']['accuracy'] * 100:.2f}%")
        print(f"Persistence (Lag-1) Accuracy: {result['baselines']['persistence_lag1']['accuracy'] * 100:.2f}%")
        print("\n--- Decision Tree Rules ---")
        print(result["decision_rules"])
    else:
        print(f"[FAIL] Training aborted: {result.get('message')}")
        sys.exit(1)

if __name__ == "__main__":
    main()
