# DATA_SOURCES.md — Data Provenance & Traceability

This document provides full traceability for all historical crime statistics, geographic coordinates, and operational staffing data utilized in **DATAMI** (**D**ata-mining **A**nalytics and **T**emporal **A**ssessment for **M**etropolitan **I**ntelligence).

> [!IMPORTANT]
> **Strict Anti-Synthetic Policy**: No crime records, response times, or staffing numbers in this application are synthesized or invented. Every single data point originates directly from official Kerala Police portals and publications.

---

## 1. Primary Data Sources

| Source Entity | Official URL | Authority Level | Granularity | Data Types Acquired |
|---|---|---|---|---|
| **Kerala Police Station Portals** | `https://ps.keralapolice.gov.in/<station_id>-ps/` | Official State Police | Police Station Level | Annual IPC & SLL totals, crime-head breakdowns, official Leaflet coordinates, station SHO, address, jurisdiction |
| **Kerala Police Staffing Registry** | `https://ps.keralapolice.gov.in/<station_id>-ps/staff-strength` | Official State Police | Police Station Level | Sanctioned strength, existing strength, vacancies by rank |
| **Kochi City Police Headquarters** | `https://kochicity.keralapolice.gov.in/crime-statistics/ipc-cases` | Official City Police Commissionerate | City-Wide Aggregated | Macro trends 2021–2026 across major IPC/BNS crime heads |
| **OpenStreetMap & Leaflet Integration** | `https://www.openstreetmap.org/` | Open Public Map Cartography | Tile Layer Standard | Verified station markers matching physical police stations |

---

## 2. Ingested Police Stations Summary

- **Total Ingested Stations**: 37
- **Kochi City Police Stations**: 29 (Core geographic focus)
- **Ernakulam Rural & Rail Stations**: 8 (Regional comparison)
- **Stations with Verified Coordinates**: 36 (97.3%)

### Kochi City Police Sub-Divisions Covered:
1. **Ernakulam Sub-Division**: Ernakulam Central, Ernakulam Town South, Ernakulam Town North, Kadavanthra, Mulavukad, Panangad, Maradu, Cheranelloor, Elamakkara, Palarivattom.
2. **Mattancherry Sub-Division**: Mattancherry, Fort Kochi, Palluruthy, Kannamali, Thoppumpady, Harbour.
3. **Thrikkakara Sub-Division**: Thrikkakara, Kalamassery, Infopark, Hill Palace (Tripunithura), Ambalamedu, Chottanikkara, Udayamperoor.
4. **Special & Traffic Units**: Kochi Metro, Fort Kochi Coastal, Ernakulam Traffic West, Traffic East, City Cyber, City Vanitha.

---

## 3. Data Schema Definition

The normalized schema implemented in SQLite (`backend/app/data/datami_crime.db`) and CSV exports (`backend/app/data/processed/`):

```sql
-- Stations Table
CREATE TABLE stations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    division TEXT,
    latitude REAL,
    longitude REAL,
    address TEXT,
    jurisdiction TEXT,
    sho_name TEXT,
    sho_phone TEXT,
    sanctioned_staff INTEGER,
    existing_staff INTEGER,
    vacancy_staff INTEGER,
    source_url TEXT NOT NULL,
    last_retrieved TEXT NOT NULL
);

-- Crime Records Table
CREATE TABLE crime_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id TEXT NOT NULL,
    year INTEGER NOT NULL,
    crime_category TEXT NOT NULL, -- IPC_TOTAL, SLL_TOTAL, ALL_TOTAL, IPC, SLL
    crime_head TEXT NOT NULL,     -- Murder, Theft, Burglary, NDPS, etc.
    case_count INTEGER NOT NULL,
    source_url TEXT NOT NULL,
    source_name TEXT NOT NULL,
    FOREIGN KEY (station_id) REFERENCES stations (id),
    UNIQUE(station_id, year, crime_category, crime_head)
);

-- Staff Strength Table
CREATE TABLE staff_strength (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id TEXT NOT NULL,
    rank TEXT NOT NULL,
    sanctioned INTEGER,
    existing INTEGER,
    vacancy INTEGER,
    FOREIGN KEY (station_id) REFERENCES stations (id)
);
```

---

## 4. Legal Framework Transition: IPC vs. BNS

- **Indian Penal Code (IPC) & SLL (2014–2023)**: Historical records are classified under the Indian Penal Code, 1860 and respective Special and Local Laws.
- **Bharatiya Nyaya Sanhita (BNS) (2024 onwards)**: The Government of India instituted the BNS in July 2024. Macro tables from Kochi City Police distinguish pre-2024 IPC figures from 2024+ BNS records.
- **Project Rule**: Incompatible legal categories are never silently combined. Trends in DATAMI clearly state whether counts reflect IPC or BNS eras.

---

## 5. Known Limitations & Caveats

1. **Reporting Granularity**: Historical statistics at station level are published annually. Monthly and daily counts do not exist in the official public tables and are NOT synthesized.
2. **Jurisdiction vs Physical Location**: Map markers indicate the physical station house, NOT the full polygon of jurisdiction.
3. **Reported vs Actual Crimes**: Raw case counts reflect formally registered FIRs. Changes in reporting behavior, awareness, or police campaigns (e.g. NDPS crackdowns) influence registered figures without necessarily indicating true underlying criminality changes.
