"""
DATAMI - Crime Analytics Service
Performs multidimensional OLAP aggregations (Slice, Dice, Roll-up, Drill-down)
in alignment with Module 1 & 2 of the S5 Data Mining Syllabus.
"""

import sqlite3
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional
from app.config import DB_PATH
from app.services.station_service import get_db_connection, get_station_by_id
from app.ml.risk_model import predict_future_station_risk

def get_metadata() -> Dict[str, Any]:
    """Provides application metadata, filter options, and data boundaries."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as cnt FROM stations")
    total_stations = cursor.fetchone()["cnt"]

    cursor.execute("SELECT COUNT(*) as cnt FROM stations WHERE district = 'Ernakulam'")
    kochi_stations = cursor.fetchone()["cnt"]

    cursor.execute("SELECT COUNT(*) as cnt FROM crime_records")
    total_records = cursor.fetchone()["cnt"]

    cursor.execute("SELECT MIN(year) as min_y, MAX(year) as max_y FROM crime_records WHERE crime_category = 'ALL_TOTAL'")
    yr_row = cursor.fetchone()
    min_year = yr_row["min_y"] if yr_row else 2014
    max_year = yr_row["max_y"] if yr_row else 2022

    # Filter options
    cursor.execute("SELECT DISTINCT district FROM stations ORDER BY district")
    districts = [r["district"] for r in cursor.fetchall()]

    cursor.execute("SELECT DISTINCT division FROM stations WHERE division IS NOT NULL ORDER BY division")
    divisions = [r["division"] for r in cursor.fetchall()]

    cursor.execute("SELECT DISTINCT year FROM crime_records ORDER BY year DESC")
    available_years = [r["year"] for r in cursor.fetchall()]

    cursor.execute("SELECT DISTINCT crime_head FROM crime_records WHERE crime_category = 'IPC' ORDER BY crime_head")
    ipc_heads = [r["crime_head"] for r in cursor.fetchall()]

    cursor.execute("SELECT DISTINCT crime_head FROM crime_records WHERE crime_category = 'SLL' ORDER BY crime_head")
    sll_heads = [r["crime_head"] for r in cursor.fetchall()]

    conn.close()

    return {
        "project_name": "DATAMI",
        "acronym_meaning": "Data-mining Analytics and Temporal Assessment for Municipal Intelligence",
        "syllabus_alignment": "KTU S5 Data Mining (PECST525)",
        "geographic_focus": "Kochi City Police, Kerala, India",
        "total_police_stations": total_stations,
        "kochi_stations_count": kochi_stations,
        "total_real_records": total_records,
        "reporting_period": f"{min_year}–{max_year}",
        "filter_options": {
            "districts": districts,
            "divisions": divisions,
            "years": available_years,
            "crime_categories": ["ALL_TOTAL", "IPC_TOTAL", "SLL_TOTAL", "IPC", "SLL"],
            "ipc_crime_heads": ipc_heads,
            "sll_crime_heads": sll_heads
        },
        "provenance_statement": "All records originate from verified official portals of the Kerala Police (ps.keralapolice.gov.in and kochicity.keralapolice.gov.in). Zero synthetic records.",
        "legal_context": "Covers IPC & SLL eras (2014–2023) and BNS transition notes (2024+)."
    }

def get_crime_summary(
    year: Optional[int] = None,
    district: Optional[str] = None,
    station_id: Optional[str] = None,
    crime_category: Optional[str] = None
) -> Dict[str, Any]:
    """Returns high-level summary KPI metrics for the selected slice."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Base query for totals
    query = """
    SELECT c.station_id, s.name as station_name, s.district, c.year, c.crime_category, c.case_count
    FROM crime_records c
    JOIN stations s ON c.station_id = s.id
    WHERE 1=1
    """
    params = []

    if year:
        query += " AND c.year = ?"
        params.append(year)
    if district and district.lower() != "all":
        query += " AND s.district = ?"
        params.append(district)
    if station_id and station_id.lower() != "all":
        query += " AND c.station_id = ?"
        params.append(station_id)

    # Calculate overall total cases
    q_total = query + " AND c.crime_category = 'ALL_TOTAL'"
    df_totals = pd.read_sql(q_total, conn, params=params)

    # Calculate IPC and SLL
    q_ipc = query + " AND c.crime_category = 'IPC_TOTAL'"
    df_ipc = pd.read_sql(q_ipc, conn, params=params)

    q_sll = query + " AND c.crime_category = 'SLL_TOTAL'"
    df_sll = pd.read_sql(q_sll, conn, params=params)

    total_registered = int(df_totals["case_count"].sum()) if not df_totals.empty else 0
    total_ipc = int(df_ipc["case_count"].sum()) if not df_ipc.empty else 0
    total_sll = int(df_sll["case_count"].sum()) if not df_sll.empty else 0
    unique_stations_count = int(df_totals["station_id"].nunique()) if not df_totals.empty else 0
    recent_year = int(df_totals["year"].max()) if not df_totals.empty else None

    # Highest and lowest stations by aggregated count in selection
    highest_station = None
    lowest_station = None

    if not df_totals.empty:
        station_sums = df_totals.groupby(["station_id", "station_name"])["case_count"].sum().reset_index()
        station_sums = station_sums.sort_values("case_count", ascending=False)

        top_row = station_sums.iloc[0]
        highest_station = {
            "station_id": top_row["station_id"],
            "station_name": top_row["station_name"],
            "recorded_cases": int(top_row["case_count"]),
            "caveat": "High raw volume may reflect high transit population, commercial hub status, or intensive enforcement rather than high residential victimization."
        }

        # Lowest with at least 1 record
        bottom_row = station_sums.iloc[-1]
        lowest_station = {
            "station_id": bottom_row["station_id"],
            "station_name": bottom_row["station_name"],
            "recorded_cases": int(bottom_row["case_count"]),
            "caveat": "Lower volume stations (e.g. specialized units like Cyber or Metro) possess distinct operational jurisdictions compared to general territorial stations."
        }

    conn.close()

    return {
        "selected_filters": {
            "year": year or "All Years",
            "district": district or "All Districts",
            "station_id": station_id or "All Stations",
            "crime_category": crime_category or "All Categories"
        },
        "total_registered_cases": total_registered,
        "ipc_cases": total_ipc,
        "sll_cases": total_sll,
        "stations_represented": unique_stations_count,
        "most_recent_year": recent_year,
        "highest_station": highest_station,
        "lowest_station": lowest_station,
        "data_notice": "Historical observations strictly derived from official police publications. Not real-time crime alerts."
    }

def get_yearly_trends(
    district: Optional[str] = None,
    station_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Returns annual time series aggregations for charting."""
    conn = get_db_connection()

    query = """
    SELECT c.year, c.crime_category, SUM(c.case_count) as total_cases, COUNT(DISTINCT c.station_id) as stations_reporting
    FROM crime_records c
    JOIN stations s ON c.station_id = s.id
    WHERE c.crime_category IN ('ALL_TOTAL', 'IPC_TOTAL', 'SLL_TOTAL')
    """
    params = []

    if district and district.lower() != "all":
        query += " AND s.district = ?"
        params.append(district)
    if station_id and station_id.lower() != "all":
        query += " AND c.station_id = ?"
        params.append(station_id)

    query += " GROUP BY c.year, c.crime_category ORDER BY c.year ASC"

    df = pd.read_sql(query, conn, params=params)
    conn.close()

    if df.empty:
        return []

    pivoted = df.pivot_table(index="year", columns="crime_category", values="total_cases", fill_value=0).reset_index()
    reporting = df[df["crime_category"] == "ALL_TOTAL"].set_index("year")["stations_reporting"].to_dict()

    trends = []
    for _, row in pivoted.iterrows():
        yr = int(row["year"])
        trends.append({
            "year": yr,
            "total_cases": int(row.get("ALL_TOTAL", 0)),
            "ipc_cases": int(row.get("IPC_TOTAL", 0)),
            "sll_cases": int(row.get("SLL_TOTAL", 0)),
            "stations_reporting": int(reporting.get(yr, 0))
        })

    return trends

def get_crime_categories_breakdown(
    year: Optional[int] = None,
    district: Optional[str] = None,
    station_id: Optional[str] = None,
    category_type: str = "IPC"
) -> List[Dict[str, Any]]:
    """Returns aggregated breakdown across specific crime heads (Murder, Theft, NDPS, etc.)."""
    conn = get_db_connection()

    query = """
    SELECT c.crime_head, SUM(c.case_count) as total_cases
    FROM crime_records c
    JOIN stations s ON c.station_id = s.id
    WHERE c.crime_category = ?
    """
    params = [category_type]

    if year:
        query += " AND c.year = ?"
        params.append(year)
    if district and district.lower() != "all":
        query += " AND s.district = ?"
        params.append(district)
    if station_id and station_id.lower() != "all":
        query += " AND c.station_id = ?"
        params.append(station_id)

    query += " GROUP BY c.crime_head ORDER BY total_cases DESC"

    df = pd.read_sql(query, conn, params=params)
    conn.close()

    if df.empty:
        return []

    total_sum = df["total_cases"].sum()
    results = []
    for _, row in df.iterrows():
        cnt = int(row["total_cases"])
        pct = round((cnt / total_sum * 100), 2) if total_sum > 0 else 0.0
        results.append({
            "crime_head": row["crime_head"],
            "case_count": cnt,
            "percentage": pct
        })

    return results

def get_station_detail(station_id: str) -> Optional[Dict[str, Any]]:
    """Comprehensive station profile with history, crime heads, staff, and risk prediction."""
    station = get_station_by_id(station_id)
    if not station:
        return None

    conn = get_db_connection()

    # 1. Yearly totals
    query_yr = """
    SELECT year, crime_category, case_count 
    FROM crime_records 
    WHERE station_id = ? AND crime_category IN ('ALL_TOTAL', 'IPC_TOTAL', 'SLL_TOTAL')
    ORDER BY year ASC
    """
    df_yr = pd.read_sql(query_yr, conn, params=[station_id])
    yearly_totals = []
    if not df_yr.empty:
        piv = df_yr.pivot_table(index="year", columns="crime_category", values="case_count", fill_value=0).reset_index()
        for _, r in piv.iterrows():
            yearly_totals.append({
                "year": int(r["year"]),
                "total_cases": int(r.get("ALL_TOTAL", 0)),
                "ipc_cases": int(r.get("IPC_TOTAL", 0)),
                "sll_cases": int(r.get("SLL_TOTAL", 0))
            })

    # 2. Detailed IPC Crime Heads for this station
    query_heads = """
    SELECT crime_head, SUM(case_count) as total_count 
    FROM crime_records 
    WHERE station_id = ? AND crime_category = 'IPC'
    GROUP BY crime_head 
    ORDER BY total_count DESC
    """
    df_heads = pd.read_sql(query_heads, conn, params=[station_id])
    ipc_heads = [
        {"crime_head": r["crime_head"], "total_count": int(r["total_count"])}
        for _, r in df_heads.iterrows()
    ]

    # 3. Detailed SLL Crime Heads
    query_sll = """
    SELECT crime_head, SUM(case_count) as total_count 
    FROM crime_records 
    WHERE station_id = ? AND crime_category = 'SLL'
    GROUP BY crime_head 
    ORDER BY total_count DESC
    """
    df_sll = pd.read_sql(query_sll, conn, params=[station_id])
    sll_heads = [
        {"crime_head": r["crime_head"], "total_count": int(r["total_count"])}
        for _, r in df_sll.iterrows()
    ]

    conn.close()

    # 4. Predict station risk
    risk_data = predict_future_station_risk(station_id=station_id)
    station_prediction = None
    if risk_data and risk_data.get("predictions"):
        station_prediction = risk_data["predictions"][0]

    return {
        "metadata": station,
        "yearly_history": yearly_totals,
        "top_ipc_crime_heads": ipc_heads[:10],
        "top_sll_crime_heads": sll_heads[:10],
        "risk_prediction": station_prediction,
        "analytical_notes": [
            "Case counts reflect formal FIR registrations at this station.",
            "Jurisdiction bounds and population census data are not standardized at station boundaries; avoid direct per-capita generalizations."
        ]
    }

def get_workload_analysis(district: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Incident volume vs staffing comparison.
    Adheres strictly to requirement 3E: Labeled as 'incident volume indicator', not confirmed overload.
    """
    conn = get_db_connection()
    query = """
    SELECT s.id, s.name, s.district, s.division, s.sanctioned_staff, s.existing_staff, s.vacancy_staff,
           (SELECT case_count FROM crime_records WHERE station_id = s.id AND crime_category = 'ALL_TOTAL' ORDER BY year DESC LIMIT 1) as latest_cases,
           (SELECT year FROM crime_records WHERE station_id = s.id AND crime_category = 'ALL_TOTAL' ORDER BY year DESC LIMIT 1) as latest_year
    FROM stations s
    WHERE s.existing_staff > 0
    """
    params = []
    if district and district.lower() != "all":
        query += " AND s.district = ?"
        params.append(district)

    query += " ORDER BY s.district, s.name"
    df = pd.read_sql(query, conn, params=params)
    conn.close()

    results = []
    for _, r in df.iterrows():
        exist = int(r["existing_staff"])
        sanc = int(r["sanctioned_staff"])
        cases = int(r["latest_cases"]) if pd.notnull(r["latest_cases"]) else 0
        yr = int(r["latest_year"]) if pd.notnull(r["latest_year"]) else None
        cases_per_officer = round(cases / exist, 1) if exist > 0 else 0.0

        results.append({
            "station_id": r["id"],
            "station_name": r["name"],
            "district": r["district"],
            "division": r["division"],
            "sanctioned_staff": sanc,
            "existing_staff": exist,
            "vacancy_count": int(r["vacancy_staff"]),
            "vacancy_percentage": round((int(r["vacancy_staff"]) / sanc * 100), 1) if sanc > 0 else 0.0,
            "latest_reporting_year": yr,
            "latest_annual_cases": cases,
            "cases_per_active_officer": cases_per_officer,
            "indicator_label": "High Volume" if cases_per_officer > 25 else ("Moderate Volume" if cases_per_officer > 10 else "Low Volume"),
            "disclaimer": "Incident volume per active officer ratio is an observational indicator, not confirmed operational overload."
        })

    return results

def get_crime_spree_readiness(
    district: Optional[str] = None, 
    surge_pct: int = 50,
    threshold: float = 25.0
) -> Dict[str, Any]:
    """
    Simulates operational readiness if a crime spree or surge occurs (e.g., +25%, +50%, +100%).
    Evaluates whether each police station is currently understaffed and how filling vacancies mitigates risk.
    Workload threshold (critical cases/officer) is fully configurable (default 25.0).
    """
    conn = get_db_connection()
    query = """
    SELECT s.id, s.name, s.district, s.division, s.latitude, s.longitude,
           s.sanctioned_staff, s.existing_staff, s.vacancy_staff,
           (SELECT case_count FROM crime_records WHERE station_id = s.id AND crime_category = 'ALL_TOTAL' ORDER BY year DESC LIMIT 1) as latest_cases,
           (SELECT year FROM crime_records WHERE station_id = s.id AND crime_category = 'ALL_TOTAL' ORDER BY year DESC LIMIT 1) as latest_year
    FROM stations s
    WHERE s.existing_staff > 0
    """
    params = []
    if district and district.lower() != "all":
        query += " AND s.district = ?"
        params.append(district)

    query += " ORDER BY s.district, s.name"
    df = pd.read_sql(query, conn, params=params)
    conn.close()

    stations_eval = []
    vulnerable_count = 0
    moderate_count = 0
    ready_count = 0

    surge_factor = 1.0 + (surge_pct / 100.0)
    crit_threshold = float(threshold)
    mod_threshold = round(crit_threshold * 0.65, 1)

    for _, r in df.iterrows():
        exist = int(r["existing_staff"])
        sanc = int(r["sanctioned_staff"])
        vac = int(r["vacancy_staff"])
        base_cases = int(r["latest_cases"]) if pd.notnull(r["latest_cases"]) else 0
        yr = int(r["latest_year"]) if pd.notnull(r["latest_year"]) else None

        base_ratio = round(base_cases / exist, 1) if exist > 0 else 0.0
        spree_cases = int(round(base_cases * surge_factor))
        spree_ratio = round(spree_cases / exist, 1) if exist > 0 else 0.0
        
        # When vacancies are filled, actual operational staff expands to exist + max(0, vac)
        staff_if_filled = exist + max(0, vac)
        ratio_if_filled = round(spree_cases / staff_if_filled, 1) if staff_if_filled > 0 else spree_ratio

        # Determine understaffing and readiness tier under crime spree using configurable threshold
        vac_rate = (vac / sanc) if sanc > 0 else 0.0
        
        if spree_ratio >= crit_threshold or (vac_rate >= 0.15 and spree_ratio >= mod_threshold):
            tier = "vulnerable"
            label = "Understaffed Alert"
            if vac > 0 and staff_if_filled > exist:
                rec = f"Station is under severe strain under a +{surge_pct}% spree ({spree_ratio} cases/officer). Filling the {vac} vacancies would expand operational staffing from {exist} to {staff_if_filled} officers, reducing officer workload from {spree_ratio} down to {ratio_if_filled} cases/officer."
            else:
                rec = f"Station is under severe strain under a +{surge_pct}% spree ({spree_ratio} cases/officer). As all sanctioned posts are filled ({exist}/{sanc}), inter-station patrol reinforcement is recommended."
            vulnerable_count += 1
        elif spree_ratio >= mod_threshold:
            tier = "moderate"
            label = "Moderate Capacity"
            rec = f"Manageable baseline ({spree_ratio} cases/officer) but requires strategic patrol reserve mobilization during a sustained +{surge_pct}% crime spree."
            moderate_count += 1
        else:
            tier = "ready"
            label = "Ready & Resilient"
            rec = f"Healthy officer-to-incident headroom ({spree_ratio} cases/officer) even under a +{surge_pct}% crime spree."
            ready_count += 1

        lat_val = None if pd.isna(r["latitude"]) else float(r["latitude"])
        lon_val = None if pd.isna(r["longitude"]) else float(r["longitude"])

        stations_eval.append({
            "station_id": r["id"],
            "station_name": r["name"],
            "district": r["district"],
            "division": r["division"],
            "latitude": lat_val,
            "longitude": lon_val,
            "sanctioned_staff": sanc,
            "existing_staff": exist,
            "vacancy_count": vac,
            "vacancy_percentage": round(vac_rate * 100, 1),
            "baseline_annual_cases": base_cases,
            "latest_reporting_year": yr,
            "baseline_cases_per_officer": base_ratio,
            "spree_surge_percentage": surge_pct,
            "spree_projected_cases": spree_cases,
            "spree_cases_per_officer": spree_ratio,
            "cases_per_officer_if_vacancies_filled": ratio_if_filled,
            "readiness_tier": tier,
            "readiness_label": label,
            "recommendation": rec
        })

    return {
        "surge_percentage_simulated": surge_pct,
        "workload_threshold_used": crit_threshold,
        "total_stations_assessed": len(stations_eval),
        "vulnerable_understaffed_count": vulnerable_count,
        "moderate_capacity_count": moderate_count,
        "ready_resilient_count": ready_count,
        "stations": stations_eval
    }

def get_olap_rollup(year: Optional[int] = None, district: Optional[str] = None) -> Dict[str, Any]:
    """
    OLAP Roll-Up Operation (Module 1):
    Aggregates granular crime facts across all 37 police stations into annual summaries
    showing Total Cases, IPC, SLL, and staff workload ratios.
    """
    conn = get_db_connection()
    
    # Identify target year if not specified (use latest year with full data)
    if not year:
        c = conn.cursor()
        c.execute("SELECT MAX(year) as max_y FROM crime_records WHERE crime_category = 'ALL_TOTAL'")
        row = c.fetchone()
        target_year = row["max_y"] if row and row["max_y"] else 2022
    else:
        target_year = year

    query = """
    SELECT 
        s.id as station_id,
        s.name as station_name,
        s.district,
        s.division,
        s.sanctioned_staff,
        s.existing_staff,
        s.vacancy_staff,
        MAX(CASE WHEN c.crime_category = 'ALL_TOTAL' THEN c.case_count ELSE 0 END) as total_crimes,
        MAX(CASE WHEN c.crime_category = 'IPC_TOTAL' THEN c.case_count ELSE 0 END) as ipc_crimes,
        MAX(CASE WHEN c.crime_category = 'SLL_TOTAL' THEN c.case_count ELSE 0 END) as sll_crimes
    FROM stations s
    LEFT JOIN crime_records c ON s.id = c.station_id AND c.year = ?
    WHERE 1=1
    """
    params = [target_year]
    if district and district.lower() != "all":
        query += " AND s.district = ?"
        params.append(district)

    query += " GROUP BY s.id ORDER BY total_crimes DESC"
    df = pd.read_sql(query, conn, params=params)
    conn.close()

    records = []
    for rank, (_, r) in enumerate(df.iterrows(), start=1):
        tot = int(r["total_crimes"])
        ipc = int(r["ipc_crimes"])
        sll = int(r["sll_crimes"])
        exist = int(r["existing_staff"]) if r["existing_staff"] else 0
        ratio = round(tot / exist, 1) if exist > 0 else 0.0

        records.append({
            "rank": rank,
            "station_id": r["station_id"],
            "station_name": r["station_name"],
            "district": r["district"],
            "division": r["division"],
            "year": target_year,
            "total_crimes": tot,
            "ipc_crimes": ipc,
            "sll_crimes": sll,
            "existing_staff": exist,
            "sanctioned_staff": int(r["sanctioned_staff"]) if r["sanctioned_staff"] else 0,
            "cases_per_officer": ratio
        })

    return {
        "operation": "OLAP Roll-Up (Station Annual Totals)",
        "year": target_year,
        "total_stations": len(records),
        "total_crimes_aggregated": sum(r["total_crimes"] for r in records),
        "records": records
    }

def get_olap_pivot(district: Optional[str] = None) -> Dict[str, Any]:
    """
    OLAP Pivot Operation (Module 1):
    Generates a cross-tabulation matrix of Stations (rows) x Years (columns)
    for total annual crime volumes.
    """
    conn = get_db_connection()
    query = """
    SELECT s.name as station_name, s.division, c.year, c.case_count
    FROM crime_records c
    JOIN stations s ON c.station_id = s.id
    WHERE c.crime_category = 'ALL_TOTAL'
    """
    params = []
    if district and district.lower() != "all":
        query += " AND s.district = ?"
        params.append(district)

    df = pd.read_sql(query, conn, params=params)
    conn.close()

    if df.empty:
        return {"columns": [], "rows": []}

    pivot = df.pivot_table(index=["station_name", "division"], columns="year", values="case_count", fill_value=0).reset_index()
    year_cols = [c for c in pivot.columns if isinstance(c, (int, np.integer))]
    year_cols.sort()

    rows = []
    for _, r in pivot.iterrows():
        station_row = {
            "station_name": r["station_name"],
            "division": r["division"]
        }
        vals = []
        for y in year_cols:
            val = int(r[y])
            station_row[str(y)] = val
            vals.append(val)
        station_row["average"] = round(float(np.mean(vals)), 1) if vals else 0
        station_row["total"] = int(np.sum(vals)) if vals else 0
        rows.append(station_row)

    rows.sort(key=lambda x: x["total"], reverse=True)

    return {
        "operation": "OLAP Pivot Table (Station x Year Matrix)",
        "years": [str(y) for y in year_cols],
        "rows": rows
    }

def get_table_preview(
    table_name: str, 
    limit: int = 50, 
    offset: int = 0,
    station_id: Optional[str] = None,
    year: Optional[int] = None,
    crime_category: Optional[str] = None,
    min_cases: Optional[int] = None,
    search: Optional[str] = None
) -> Dict[str, Any]:
    """
    Provides tabular preview for Step 3 Data Warehouse viewer with filtering and sorting.
    Allows filtering by station, year, category, and non-zero counts.
    """
    allowed_tables = ["stations", "crime_records", "staff_strength", "city_macro_crimes"]
    if table_name not in allowed_tables:
        table_name = "stations"

    conn = get_db_connection()
    cursor = conn.cursor()

    # Base query building
    where_clauses = []
    params = []

    if table_name == "crime_records":
        if station_id and station_id.lower() != "all":
            where_clauses.append("station_id = ?")
            params.append(station_id)
        if year and year > 0:
            where_clauses.append("year = ?")
            params.append(year)
        if crime_category and crime_category.lower() != "all":
            where_clauses.append("crime_category = ?")
            params.append(crime_category)
        if min_cases is not None:
            where_clauses.append("case_count >= ?")
            params.append(min_cases)
        if search:
            where_clauses.append("(crime_head LIKE ? OR station_id LIKE ?)")
            params.extend([f"%{search}%", f"%{search}%"])

    elif table_name == "stations":
        if search:
            where_clauses.append("(name LIKE ? OR division LIKE ? OR jurisdiction LIKE ?)")
            params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])

    where_sql = (" WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

    # Count total matching rows
    count_sql = f"SELECT COUNT(*) as cnt FROM {table_name}{where_sql}"
    cursor.execute(count_sql, params)
    total_count = cursor.fetchone()["cnt"]

    # Sorting logic
    if table_name == "crime_records":
        order_sql = " ORDER BY case_count DESC, year DESC"
    elif table_name == "stations":
        order_sql = " ORDER BY district, name"
    else:
        order_sql = " ORDER BY id"

    query_sql = f"SELECT * FROM {table_name}{where_sql}{order_sql} LIMIT ? OFFSET ?"
    query_params = params + [limit, offset]
    cursor.execute(query_sql, query_params)
    rows = [dict(r) for r in cursor.fetchall()]

    # Fetch available distinct stations and years for dropdown filters
    cursor.execute("SELECT DISTINCT id, name FROM stations ORDER BY name")
    available_stations = [{"id": r["id"], "name": r["name"]} for r in cursor.fetchall()]

    cursor.execute("SELECT DISTINCT year FROM crime_records ORDER BY year DESC")
    available_years = [r["year"] for r in cursor.fetchall()]

    cursor.execute("SELECT DISTINCT crime_category FROM crime_records ORDER BY crime_category")
    available_categories = [r["crime_category"] for r in cursor.fetchall()]

    conn.close()

    columns = list(rows[0].keys()) if rows else []
    return {
        "table_name": table_name,
        "total_rows": total_count,
        "limit": limit,
        "offset": offset,
        "columns": columns,
        "rows": rows,
        "filter_options": {
            "stations": available_stations,
            "years": available_years,
            "categories": available_categories
        }
    }

def get_pipeline_summary() -> Dict[str, Any]:
    """Returns status and record metrics across all 5 KDD pipeline steps."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as cnt FROM stations")
    station_count = cursor.fetchone()["cnt"]
    cursor.execute("SELECT COUNT(*) as cnt FROM crime_records")
    crime_count = cursor.fetchone()["cnt"]
    cursor.execute("SELECT COUNT(*) as cnt FROM staff_strength")
    staff_count = cursor.fetchone()["cnt"]
    cursor.execute("SELECT MIN(year) as min_y, MAX(year) as max_y FROM crime_records WHERE crime_category = 'ALL_TOTAL'")
    y_row = cursor.fetchone()
    conn.close()

    return {
        "pipeline_name": "DATAMI KDD Pipeline (PECST525)",
        "steps": [
            {
                "step": 1,
                "title": "Data Extraction",
                "status": "completed",
                "description": "Harvests raw records from official Kerala Police station portals and Kochi City Commissionerate.",
                "details": f"{station_count} stations targeted, raw HTML cached in backend/app/data/raw/."
            },
            {
                "step": 2,
                "title": "Cleaning & Normalization",
                "status": "completed",
                "description": "Handles zero counts vs missing years, harmonizes station names, and generates spatial concept hierarchies.",
                "details": "Unified schema: station_name, district, year, crime_category, case_count, source_url."
            },
            {
                "step": 3,
                "title": "Data Warehouse & Export",
                "status": "completed",
                "description": "Consolidates facts and dimensions in SQLite datami_crime.db and exports clean CSVs.",
                "details": f"{crime_count:,} crime facts, {station_count} station dimensions, {staff_count} staff records."
            },
            {
                "step": 4,
                "title": "ML Risk & Spree Readiness",
                "status": "completed",
                "description": "Trains CART Decision Tree on historical lags and simulates crime spree surge readiness.",
                "details": "Features: lag1, lag2, rolling_avg, trend_rate, sll_ratio. Evaluates understaffing during crime surges."
            },
            {
                "step": 5,
                "title": "Geospatial Intelligence Map",
                "status": "completed",
                "description": "Interactive Leaflet OpenStreetMap visualizing all stations, risk levels, and drill-down details.",
                "details": "Clickable markers opening comprehensive station history, risk rating, and readiness gauges."
            }
        ]
    }

def export_table_to_csv(table_name: str) -> str:
    """Exports a warehouse table or OLAP view as CSV text."""
    conn = get_db_connection()
    if table_name == "olap_rollup":
        c = conn.cursor()
        c.execute("SELECT MAX(year) as max_y FROM crime_records WHERE crime_category = 'ALL_TOTAL'")
        row = c.fetchone()
        target_year = row["max_y"] if row and row["max_y"] else 2022
        query = """
        SELECT 
            s.name as station_name,
            s.district,
            s.division,
            ? as year,
            MAX(CASE WHEN c.crime_category = 'ALL_TOTAL' THEN c.case_count ELSE 0 END) as total_annual_crimes,
            MAX(CASE WHEN c.crime_category = 'IPC_TOTAL' THEN c.case_count ELSE 0 END) as ipc_crimes,
            MAX(CASE WHEN c.crime_category = 'SLL_TOTAL' THEN c.case_count ELSE 0 END) as sll_crimes,
            s.sanctioned_staff,
            s.existing_staff,
            s.vacancy_staff
        FROM stations s
        LEFT JOIN crime_records c ON s.id = c.station_id AND c.year = ?
        GROUP BY s.id
        ORDER BY total_annual_crimes DESC
        """
        df = pd.read_sql(query, conn, params=[target_year, target_year])
    else:
        allowed = ["stations", "crime_records", "staff_strength", "city_macro_crimes"]
        if table_name not in allowed:
            table_name = "stations"
        df = pd.read_sql(f"SELECT * FROM {table_name}", conn)

    conn.close()
    return df.to_csv(index=False)

