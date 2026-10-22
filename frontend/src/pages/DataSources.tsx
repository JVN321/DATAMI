import React from 'react';
import { 
  Database, 
  ExternalLink, 
  ShieldCheck, 
  BookOpen, 
  FileCode, 
  AlertTriangle,
  Scale,
  GraduationCap
} from 'lucide-react';
import { Metadata } from '../types';

interface DataSourcesProps {
  metadata: Metadata | null;
}

export const DataSourcesPage: React.FC<DataSourcesProps> = ({ metadata }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Data Provenance, Quality & Methodology
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              100% genuine historical crime records and administrative registers from official state authorities.
            </p>
          </div>
        </div>

        {/* Academic Syllabus Banner */}
        <div className="mt-5 p-4 rounded-xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-sky-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <GraduationCap className="w-4 h-4" />
              <span>KTU S5 Course Syllabus Alignment</span>
            </span>
            <h3 className="text-base font-extrabold mt-1">
              PECST525: Data Mining (S5 Common)
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Engineered as a reference college project implementing KDD data warehousing, data preprocessing, decision tree classification, and spatial mining.
            </p>
          </div>

          <div className="text-xs bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 font-mono text-sky-300">
            Acronym: DATAMI
          </div>
        </div>
      </div>

      {/* Primary Data Sources Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h3 className="font-bold text-sm text-slate-900 mb-3 border-b border-slate-100 pb-2 flex items-center space-x-2">
          <Database className="w-4 h-4 text-sky-600" />
          <span>Primary Traceable Data Sources</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Data Provider</th>
                <th className="py-2.5 px-3">Official URL</th>
                <th className="py-2.5 px-3">Granularity</th>
                <th className="py-2.5 px-3">Data Extracted</th>
                <th className="py-2.5 px-3">Provenance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">Kerala Police Station Directory</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-sky-600">
                  <a href="https://ps.keralapolice.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
                    https://ps.keralapolice.gov.in/ <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </td>
                <td className="py-2.5 px-3">Police Station</td>
                <td className="py-2.5 px-3">Coordinates, jurisdiction, addresses, SHO contacts</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Official State Gov</span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">Kerala Police Crime Statistics</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-sky-600">
                  <a href="https://ps.keralapolice.gov.in/ernakulamcentral-ps/crime-statistics" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
                    ps.keralapolice.gov.in/*/crime-statistics <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </td>
                <td className="py-2.5 px-3">Station &times; Year</td>
                <td className="py-2.5 px-3">Annual IPC & SLL totals, 25+ crime heads (2014–2022)</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Official State Gov</span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">Station Staff Strength Registry</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-sky-600">
                  <a href="https://ps.keralapolice.gov.in/ernakulamcentral-ps/staff-strength" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
                    ps.keralapolice.gov.in/*/staff-strength <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </td>
                <td className="py-2.5 px-3">Station &times; Rank</td>
                <td className="py-2.5 px-3">Sanctioned strength, active staff, vacancies by rank</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Official State Gov</span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">Kochi City Police Headquarters</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-sky-600">
                  <a href="https://kochicity.keralapolice.gov.in/crime-statistics/ipc-cases" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
                    https://kochicity.keralapolice.gov.in/ <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </td>
                <td className="py-2.5 px-3">City Commissionerate</td>
                <td className="py-2.5 px-3">Macro trends (2021–2026), BNS vs IPC transitions</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">City Police Comm'te</span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">OpenStreetMap Foundation</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-sky-600">
                  <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
                    https://www.openstreetmap.org/ <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </td>
                <td className="py-2.5 px-3">Geospatial Cartography</td>
                <td className="py-2.5 px-3">Standard tile layer for interactive Leaflet rendering</td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px]">ODbL Public Carto</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Syllabus Mapping Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h3 className="font-bold text-sm text-slate-900 mb-3 border-b border-slate-100 pb-2 flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-purple-600" />
          <span>Syllabus Modules & Project Implementation Mapping</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-600"></span>
              <span>Module 1: Data Mining Fundamentals & Warehousing</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Implemented multidimensional data model (Fact table: <code>crime_records</code>, Dimensions: <code>stations</code>, <code>staff_strength</code>). 
              Provides operational OLAP aggregations (Slice, Dice, Roll-up across sub-divisions, Drill-down into specific crime heads).
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>Module 2: Data Preprocessing & Discretization</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Rigorous data cleaning: explicit distinction between verified zero counts and unobserved years. 
              Concept hierarchy generation (State &rarr; District &rarr; Sub-Division &rarr; Station House). Discretization of continuous annual volume into relative risk tiers.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Module 3: Decision Tree Classification & Evaluation</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Constructed explainable Decision Tree classifier with Gini impurity splitting. 
              Enforces strictly chronological train/test partitioning (Train: 2016–2019, Test: 2020–2025). 
              Evaluated with Accuracy, Precision, Recall, F1-Score, Confusion Matrix, and Zero-R/Persistence baselines.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              <span>Module 4: Spatial Analytics & Web Data Extraction</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Web scraping pipeline extracting authentic coordinates, tables, and staff metadata. 
              Interactive geospatial visualization with OpenStreetMap Leaflet layers.
            </p>
          </div>
        </div>
      </div>

      {/* IPC vs BNS Legal Transition Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center space-x-2">
          <Scale className="w-4 h-4 text-amber-600" />
          <span>Legal Classification Framework: IPC vs. BNS (2024 Transition)</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Historical records from 2014 to 2023 are classified under the <strong>Indian Penal Code (IPC)</strong> and corresponding <strong>Special and Local Laws (SLL)</strong>. 
          In July 2024, the Government of India enacted the <strong>Bharatiya Nyaya Sanhita (BNS)</strong>. 
          In accordance with project integrity standards, incompatible legal categories are never silently concatenated. Macro statistics in DATAMI maintain explicit classification tags.
        </p>
      </div>

      {/* Local Project Documentation Links */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3 flex items-center space-x-2">
          <FileCode className="w-4 h-4 text-slate-600" />
          <span>Project Markdown Documentation (docs/ Directory)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900">docs/ARCHITECTURE.md</div>
            <p className="text-slate-500 text-[11px] mt-0.5">End-to-end system design, KDD pipeline, and OLAP model.</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900">docs/DATA_SOURCES.md</div>
            <p className="text-slate-500 text-[11px] mt-0.5">Traceable provenance, URL references, and station directory.</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900">docs/DATA_QUALITY.md</div>
            <p className="text-slate-500 text-[11px] mt-0.5">Missing value audit, zero-count policy, and coverage report.</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900">docs/ML_METHODOLOGY.md</div>
            <p className="text-slate-500 text-[11px] mt-0.5">Decision tree formulation, chronological split, and evaluation math.</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900">docs/API_SPECIFICATION.md</div>
            <p className="text-slate-500 text-[11px] mt-0.5">FastAPI REST contract, query filters, and payload models.</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900">docs/RUNBOOK.md</div>
            <p className="text-slate-500 text-[11px] mt-0.5">Commands to ingest data, train model, and run backend/frontend.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
