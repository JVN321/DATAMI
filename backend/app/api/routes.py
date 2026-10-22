"""
DATAMI - REST API Endpoints
Provides structured JSON responses for crime statistics, station coordinates,
OLAP aggregations, Decision Tree risk predictions, and model evaluation metrics.
"""

from fastapi import APIRouter, HTTPException, Query, Response
from typing import Optional, List, Dict, Any

from app.services.station_service import get_all_stations, get_station_by_id
from app.services.crime_service import (
    get_metadata,
    get_crime_summary,
    get_yearly_trends,
    get_crime_categories_breakdown,
    get_station_detail,
    get_workload_analysis,
    get_crime_spree_readiness,
    get_olap_rollup,
    get_olap_pivot,
    get_table_preview,
    get_pipeline_summary,
    export_table_to_csv
)
from app.ml.risk_model import (
    predict_future_station_risk,
    get_model_evaluation,
    train_and_evaluate
)

router = APIRouter(prefix="/api")

@router.get("/health", tags=["System"])
def health_check():
    """Returns system status, active database verification, and service health."""
    return {
        "status": "healthy",
        "service": "DATAMI Crime Analytics & Prediction Platform",
        "version": "1.0.0"
    }

@router.get("/metadata", tags=["Metadata"])
def metadata():
    """Returns application boundaries, available filters, and dataset metadata."""
    return get_metadata()

@router.get("/stations", tags=["Police Stations"])
def list_stations(
    district: Optional[str] = Query(None, description="Filter by district (e.g. 'Ernakulam', 'Ernakulam Rural')"),
    division: Optional[str] = Query(None, description="Filter by sub-division (e.g. 'Ernakulam Sub-Division')")
):
    """Lists all police stations with verified geocoordinates, address, SHO info, and total recorded cases."""
    return get_all_stations(district=district, division=division)

@router.get("/crimes/summary", tags=["Crime Analytics"])
def crime_summary(
    year: Optional[int] = Query(None, description="Filter by specific reporting year (e.g. 2021)"),
    district: Optional[str] = Query(None, description="Filter by district"),
    station_id: Optional[str] = Query(None, description="Filter by station ID"),
    crime_category: Optional[str] = Query(None, description="Filter by category (IPC_TOTAL, SLL_TOTAL, ALL_TOTAL)")
):
    """Returns aggregated crime KPIs, station count, and highest/lowest recorded stations."""
    return get_crime_summary(
        year=year,
        district=district,
        station_id=station_id,
        crime_category=crime_category
    )

@router.get("/crimes/trends", tags=["Crime Analytics"])
def crime_trends(
    district: Optional[str] = Query(None, description="Filter by district"),
    station_id: Optional[str] = Query(None, description="Filter by station ID")
):
    """Returns annual time series counts (ALL_TOTAL, IPC, SLL, and reporting stations) for trend charting."""
    return get_yearly_trends(district=district, station_id=station_id)

@router.get("/crimes/categories", tags=["Crime Analytics"])
def crime_categories(
    year: Optional[int] = Query(None, description="Filter by reporting year"),
    district: Optional[str] = Query(None, description="Filter by district"),
    station_id: Optional[str] = Query(None, description="Filter by station ID"),
    category_type: str = Query("IPC", description="Category type ('IPC' or 'SLL')")
):
    """Returns distribution of individual crime heads (Theft, Burglary, Hurt, Riots, NDPS, etc.)."""
    return get_crime_categories_breakdown(
        year=year,
        district=district,
        station_id=station_id,
        category_type=category_type
    )

@router.get("/crimes/station/{station_id}", tags=["Police Stations"])
def station_detail(station_id: str):
    """Returns detailed history, crime breakdown, staffing numbers, and risk prediction for a single station."""
    detail = get_station_detail(station_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Police station '{station_id}' not found.")
    return detail

@router.get("/predictions/risk", tags=["Data Mining & Prediction"])
def predict_risk(
    station_id: Optional[str] = Query(None, description="Optional single station ID filter")
):
    """
    Predicts whether police stations will fall into Higher or Lower Relative Risk categories
    for upcoming reporting periods using the explainable Decision Tree classifier.
    """
    return predict_future_station_risk(station_id=station_id)

@router.get("/model/evaluation", tags=["Data Mining & Prediction"])
def model_evaluation():
    """
    Returns Decision Tree evaluation report: Accuracy, Precision, Recall, F1-Score,
    Confusion Matrix, Zero-R & Persistence baselines, and human-readable decision rules.
    """
    return get_model_evaluation()

@router.post("/model/retrain", tags=["Data Mining & Prediction"])
def retrain_model(
    split_year: int = Query(2020, description="Chronological test cutoff year"),
    max_depth: int = Query(3, description="Decision Tree maximum depth (for explainability)"),
    criterion: str = Query("gini", description="Split criterion ('gini' or 'entropy')")
):
    """Retrains the Decision Tree classifier with custom hyperparameters adhering to Syllabus Module 3."""
    return train_and_evaluate(split_year=split_year, max_depth=max_depth, criterion=criterion)

@router.get("/workload", tags=["Workload & Staffing"])
def workload_analysis(
    district: Optional[str] = Query(None, description="Filter by district")
):
    """
    Returns incident-volume vs active staffing ratio analysis with prominent caveats.
    Strictly observational (incident volume indicator, not confirmed overload).
    """
    return get_workload_analysis(district=district)

@router.get("/readiness", tags=["Crime Spree & Staffing Readiness"])
def crime_spree_readiness(
    district: Optional[str] = Query(None, description="Filter by district"),
    surge_pct: int = Query(50, description="Crime spree surge percentage (+25, +50, +100)"),
    threshold: float = Query(25.0, description="Configurable workload capacity threshold (cases/officer)")
):
    """
    Evaluates whether police stations are currently understaffed and simulates operational readiness
    during potential crime sprees (+25%, +50%, +100% surge scenarios).
    Threshold for critical officer caseload is configurable (default: 25.0 cases/officer).
    """
    return get_crime_spree_readiness(district=district, surge_pct=surge_pct, threshold=threshold)

@router.get("/data/olap/rollup", tags=["Data Warehouse & OLAP"])
def olap_rollup(
    year: Optional[int] = Query(None, description="Filter by year (defaults to latest complete year)"),
    district: Optional[str] = Query(None, description="Filter by district")
):
    """
    OLAP Roll-Up Operation (Module 1):
    Aggregates granular crime facts across all 37 police stations into annual summaries
    showing Total Cases, IPC, SLL, and staff workload ratios.
    """
    return get_olap_rollup(year=year, district=district)

@router.get("/data/olap/pivot", tags=["Data Warehouse & OLAP"])
def olap_pivot(
    district: Optional[str] = Query(None, description="Filter by district")
):
    """
    OLAP Pivot Operation (Module 1):
    Generates a cross-tabulation matrix of Stations (rows) x Years (columns)
    for total annual crime volumes.
    """
    return get_olap_pivot(district=district)

@router.get("/data/preview/{table_name}", tags=["Data Warehouse"])
def table_preview(
    table_name: str,
    limit: int = Query(50, description="Row limit"),
    offset: int = Query(0, description="Row offset"),
    station_id: Optional[str] = Query(None, description="Optional station ID filter"),
    year: Optional[int] = Query(None, description="Optional year filter"),
    crime_category: Optional[str] = Query(None, description="Optional crime category filter"),
    min_cases: Optional[int] = Query(None, description="Minimum case count (e.g. 1 to hide 0s)"),
    search: Optional[str] = Query(None, description="Text search across crime heads or station names")
):
    """Returns paginated tabular preview for stations, crime_records, staff_strength, or city_macro_crimes with filters."""
    return get_table_preview(
        table_name=table_name,
        limit=limit,
        offset=offset,
        station_id=station_id,
        year=year,
        crime_category=crime_category,
        min_cases=min_cases,
        search=search
    )

@router.get("/data/export/csv/{table_name}", tags=["Data Warehouse"])
def download_csv(table_name: str):
    """Generates and streams a downloadable CSV export of the requested warehouse table or OLAP rollup."""
    csv_content = export_table_to_csv(table_name=table_name)
    filename = f"{table_name}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/pipeline/summary", tags=["KDD Pipeline"])
def pipeline_summary():
    """Returns status and metrics across all 5 KDD pipeline steps."""
    return get_pipeline_summary()


