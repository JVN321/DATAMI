import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "datami_crime.db")
MODEL_DIR = os.path.join(BASE_DIR, "ml", "saved_models")
os.makedirs(MODEL_DIR, exist_ok=True)
MODEL_PATH = os.path.join(MODEL_DIR, "risk_decision_tree.pkl")
EVAL_PATH = os.path.join(DATA_DIR, "model_evaluation.json")

DEFAULT_DISTRICT = "Ernakulam"
DEFAULT_CITY = "Kochi"
