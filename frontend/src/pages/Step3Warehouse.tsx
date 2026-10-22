import React, { useEffect, useState } from 'react';
import { 
  Database, 
  ArrowRight, 
  ArrowLeft, 
  Download, 
  FileSpreadsheet, 
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  Server,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { TablePreview } from '../types';

interface Step3WarehouseProps {
  onNextStep: () => void;
  onPrevStep: () => void;
}

export const Step3Warehouse: React.FC<Step3WarehouseProps> = ({
  onNextStep,
  onPrevStep,
}) => {
  const [selectedTable, setSelectedTable] = useState<string>('stations');
  const [preview, setPreview] = useState<TablePreview | null>(null);
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const pageSize = 12;

  useEffect(() => {
    setLoading(true);
    api.getTablePreview(selectedTable, pageSize, page * pageSize)
      .then((res) => setPreview(res))
      .catch((err) => console.error('Failed to load table preview:', err))
      .finally(() => setLoading(false));
  }, [selectedTable, page]);

  const handleTableChange = (tab: string) => {
    setSelectedTable(tab);
    setPage(0);
  };

  const totalPages = preview ? Math.ceil(preview.total_rows / pageSize) : 1;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 flex-shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                  Pipeline Step 3 of 5
                </span>
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Relational Storage & Warehouse
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Data Warehouse & Exported Datasets
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Consolidated SQLite schema (<code className="font-mono text-purple-700">datami_crime.db</code>) and clean CSV tabular exports.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-center">
            <button
              onClick={onPrevStep}
              className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Step 2</span>
            </button>
            <button
              onClick={onNextStep}
              className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
            >
              <span>Proceed to Step 4: ML & Readiness</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Exportable Processed CSV Datasets Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dimension Table</span>
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="font-bold text-base text-slate-900 mt-1">stations.csv</h4>
            <p className="text-xs text-slate-500 mt-1">
              37 police stations with verified Leaflet lat/long, address, jurisdiction, and staff establishment.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono text-[11px]">37 rows &bull; 15 cols</span>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              CSV Exported
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fact Table</span>
              <FileSpreadsheet className="w-4 h-4 text-sky-600" />
            </div>
            <h4 className="font-bold text-base text-slate-900 mt-1">crime_records.csv</h4>
            <p className="text-xs text-slate-500 mt-1">
              14,262 normalized crime facts by station, year, legal classification, and offense heads (2014–2023).
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono text-[11px]">14,262 rows &bull; 7 cols</span>
            <span className="text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
              CSV Exported
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Operational Dimension</span>
              <FileSpreadsheet className="w-4 h-4 text-purple-600" />
            </div>
            <h4 className="font-bold text-base text-slate-900 mt-1">staff_strength.csv</h4>
            <p className="text-xs text-slate-500 mt-1">
              250 records detailing sanctioned posts, active strength, and vacancies across police ranks.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono text-[11px]">250 rows &bull; 5 cols</span>
            <span className="text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
              CSV Exported
            </span>
          </div>
        </div>
      </div>

      {/* Interactive SQL Table Browser */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center space-x-2">
            <TableIcon className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Interactive Warehouse Table Viewer
              </h3>
              <p className="text-xs text-slate-500">
                Live query preview directly from <code className="font-mono text-purple-700">backend/app/data/datami_crime.db</code>
              </p>
            </div>
          </div>

          {/* Table Switcher Pills */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg">
            {['stations', 'crime_records', 'staff_strength', 'city_macro_crimes'].map((t) => (
              <button
                key={t}
                onClick={() => handleTableChange(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  selectedTable === t
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Table Data View */}
        <div className="overflow-x-auto mt-4 max-h-96">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0 z-10 shadow-sm">
              <tr>
                {preview?.columns.map((col) => (
                  <th key={col} className="py-2.5 px-3 whitespace-nowrap bg-slate-50">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
              {preview?.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/80">
                  {preview.columns.map((col) => (
                    <td key={col} className="py-2 px-3 whitespace-nowrap max-w-xs truncate">
                      {row[col] !== null && row[col] !== undefined ? String(row[col]) : (
                        <span className="text-slate-300 font-sans italic">NULL</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination & Count Controls */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing rows {page * pageSize + 1} to {Math.min((page + 1) * pageSize, preview?.total_rows || 0)} of {preview?.total_rows.toLocaleString()}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onPrevStep}
            className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Step 2: Cleaning</span>
          </button>
          <button
            onClick={onNextStep}
            className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <span>Proceed to Step 4: ML Models & Spree Readiness</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
