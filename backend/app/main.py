"""
DATAMI - FastAPI Application Entrypoint
Data-mining Analytics and Temporal Assessment for Municipal Intelligence
Kochi Police Station Crime Analytics & Prediction Platform
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI(
    title="DATAMI — Kochi Crime Analytics & Prediction API",
    description="""
    **DATAMI** (**D**ata-mining **A**nalytics and **T**emporal **A**ssessment for **M**unicipal **I**ntelligence)
    is an explainable data-mining and analytics platform built on real historical police statistics for Kochi and Ernakulam, Kerala, India.
    
    Adheres strictly to the **KTU S5 Data Mining Syllabus (PECST525)**:
    - **Module 1**: Multidimensional OLAP Cubes & Aggregations
    - **Module 2**: Data Preprocessing, Cleaning & Concept Hierarchy
    - **Module 3**: Decision Tree Induction (CART / Gini Index) & Transparent Evaluation
    - **Module 4**: Spatial Mapping & Pattern Analysis
    
    **Data Provenance**: 100% genuine official data harvested from `ps.keralapolice.gov.in` and `kochicity.keralapolice.gov.in`. Zero synthetic data.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/", tags=["System"])
def root():
    return {
        "message": "Welcome to DATAMI API (Kochi Crime Analytics & Prediction)",
        "acronym": "Data-mining Analytics and Temporal Assessment for Municipal Intelligence",
        "documentation": "/docs",
        "health": "/api/health",
        "metadata": "/api/metadata"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8001, reload=True)
