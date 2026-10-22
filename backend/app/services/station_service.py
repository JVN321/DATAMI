"""
DATAMI - Station Service
Queries police station metadata, verified geographic coordinates, and administrative records.
"""

import sqlite3
import pandas as pd
from typing import List, Dict, Any, Optional
from app.config import DB_PATH

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_all_stations(district: Optional[str] = None, division: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieve all stations with optional district or division filter."""
    conn = get_db_connection()
    query = "SELECT * FROM stations WHERE 1=1"
    params = []
    
    if district and district.lower() != "all":
        query += " AND district = ?"
        params.append(district)
    if division and division.lower() != "all":
        query += " AND division = ?"
        params.append(division)
        
    query += " ORDER BY district, name"
    cursor = conn.cursor()
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    stations = []
    for r in rows:
        d = dict(r)
        # Add quick summary stats
        cur2 = conn.cursor()
        cur2.execute("""
            SELECT MIN(year) as min_yr, MAX(year) as max_yr, SUM(case_count) as total_cases
            FROM crime_records
            WHERE station_id = ? AND crime_category = 'ALL_TOTAL'
        """, (d["id"],))
        summary = cur2.fetchone()
        d["min_year"] = summary["min_yr"] if summary else None
        d["max_year"] = summary["max_yr"] if summary else None
        d["total_cases_recorded"] = summary["total_cases"] if summary and summary["total_cases"] else 0
        stations.append(d)
        
    conn.close()
    return stations

def get_station_by_id(station_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve single station metadata."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stations WHERE id = ?", (station_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
    d = dict(row)
    
    # Get staff strength breakdown
    cursor.execute("SELECT rank, sanctioned, existing, vacancy FROM staff_strength WHERE station_id = ? ORDER BY sanctioned DESC", (station_id,))
    d["staff_breakdown"] = [dict(r) for r in cursor.fetchall()]
    
    conn.close()
    return d
