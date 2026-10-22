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
  Filter,
  Layers,
  Sparkles,
  BarChart3,
  TrendingUp,
  Search,
  CheckCircle2,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

import { api } from '../services/api';
import { TablePreview, OlapRollupResponse, OlapPivotResponse } from '../types';

interface Step3WarehouseProps {
  onNextStep: () => void;
  onPrevStep: () => void;
}

export const Step3Warehouse: React.FC<Step3WarehouseProps> = ({
  onNextStep,
  onPrevStep,
}) => {
  // Sub-tab selection: 'rollup' | 'pivot' | 'raw_tables'
  const [activeSubTab, setActiveSubTab] = useState<'rollup' | 'pivot' | 'raw_tables'>('rollup');

  // OLAP Roll-up state
  const [rollupYear, setRollupYear] = useState<number>(2022);
  const [rollupData, setRollupData] = useState<OlapRollupResponse | null>(null);
  const [rollupLoading, setRollupLoading] = useState<boolean>(true);

  // OLAP Pivot state
  const [pivotData, setPivotData] = useState<OlapPivotResponse | null>(null);
  const [pivotLoading, setPivotLoading] = useState<boolean>(false);

  // Raw Table state
  const [selectedTable, setSelectedTable] = useState<string>('crime_records');
  const [preview, setPreview] = useState<TablePreview | null>(null);
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const pageSize = 12;

  // Filters for Raw Table
  const [filterStation, setFilterStation] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [hideZeros, setHideZeros] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Fetch OLAP Roll-up
  useEffect(() => {
    if (activeSubTab === 'rollup') {
      setRollupLoading(true);
      api.getOlapRollup(rollupYear)
        .then((res) => setRollupData(res))
        .catch((err) => console.error('Failed to load OLAP roll-up:', err))
        .finally(() => setRollupLoading(false));
    }
  }, [activeSubTab, rollupYear]);

  // 2. Fetch OLAP Pivot
  useEffect(() => {
    if (activeSubTab === 'pivot' && !pivotData) {
      setPivotLoading(true);
      api.getOlapPivot()
        .then((res) => setPivotData(res))
        .catch((err) => console.error('Failed to load OLAP pivot:', err))
        .finally(() => setPivotLoading(false));
    }
  }, [activeSubTab, pivotData]);

  // 3. Fetch Raw Table with Filters
  useEffect(() => {
    if (activeSubTab === 'raw_tables') {
      setLoading(true);
      api.getTablePreview(selectedTable, {
        limit: pageSize,
        offset: page * pageSize,
        station_id: filterStation !== 'all' ? filterStation : undefined,
        year: filterYear !== 'all' ? Number(filterYear) : undefined,
        crime_category: filterCategory !== 'all' ? filterCategory : undefined,
        min_cases: (selectedTable === 'crime_records' && hideZeros) ? 1 : undefined,
        search: searchQuery.trim() ? searchQuery.trim() : undefined,
      })
        .then((res) => setPreview(res))
        .catch((err) => console.error('Failed to load table preview:', err))
        .finally(() => setLoading(false));
    }
  }, [activeSubTab, selectedTable, page, filterStation, filterYear, filterCategory, hideZeros, searchQuery]);

  const handleTableChange = (tableName: string) => {
    setSelectedTable(tableName);
    setPage(0);
    setSearchQuery('');
  };

  const handleDownloadCsv = (tableName: string) => {
    const url = api.getCsvExportUrl(tableName);
    window.open(url, '_blank');
  };

  const totalPages = preview ? Math.ceil(preview.total_rows / pageSize) : 1;

  // Chart data for top 8 stations in roll-up
  const topStationsChart = rollupData?.records?.slice(0, 8).map((r) => ({
    name: r.station_name.replace('Police Station', '').trim(),
    Total: r.total_crimes,
    IPC: r.ipc_crimes,
    SLL: r.sll_crimes,
  })) || [];

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
                  Relational Storage & Multidimensional OLAP
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Data Warehouse, OLAP Analytics & CSV Exports
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Inspect multi-station crime roll-ups, pivot tables across 10 years, and download verifiable CSV datasets.
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

      {/* Educational Callout: Fact Table Granularity vs OLAP Roll-up */}
      <div className="bg-slate-900 text-slate-200 rounded-xl p-4 border border-slate-800 shadow-sm text-xs">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-white text-sm">
              Understanding the Warehouse Fact Table: Why Raw Crime Head Rows are Small Numbers (0, 1, 2)
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              In dimensional modeling (KTU S5 Module 1), the fact table <code className="font-mono text-purple-300">crime_records</code> has a grain of <strong>1 record per Station × Year × Specific Crime Head</strong>. Specific severe offenses (e.g. Murder, Dacoity, Counterfeiting) legitimately occur 0 to 2 times a year at most stations. To see the full annual volume (1,000–3,000 cases per station), use the <strong>OLAP Roll-Up</strong> operation below, which rolls up category facts to station annual totals.
            </p>
          </div>
        </div>
      </div>

      {/* Downloadable Official Datasets Cards with Direct CSV Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dimension Table</span>
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 mt-1">stations.csv</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              37 police stations with verified Leaflet lat/long, sub-division, address, and sanctioned staffing.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-slate-500 font-mono text-[10px]">37 rows &bull; 15 cols</span>
            <button
              onClick={() => handleDownloadCsv('stations')}
              className="inline-flex items-center space-x-1 text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 text-xs transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fact Table</span>
              <FileSpreadsheet className="w-4 h-4 text-sky-600" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 mt-1">crime_records.csv</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              14,262 normalized crime facts by station, year, legal classification, and offense heads (2014–2023).
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-slate-500 font-mono text-[10px]">14,262 rows</span>
            <button
              onClick={() => handleDownloadCsv('crime_records')}
              className="inline-flex items-center space-x-1 text-sky-700 font-bold bg-sky-50 hover:bg-sky-100 px-2 py-1 rounded border border-sky-200 text-xs transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">OLAP Roll-up</span>
              <FileSpreadsheet className="w-4 h-4 text-purple-600" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 mt-1">station_annual_totals.csv</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Aggregated annual totals for all 37 stations with IPC, SLL, and officer workload ratios.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-purple-600 font-mono text-[10px]">Annual Summary</span>
            <button
              onClick={() => handleDownloadCsv('olap_rollup')}
              className="inline-flex items-center space-x-1 text-purple-700 font-bold bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded border border-purple-200 text-xs transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Staffing Dimension</span>
              <FileSpreadsheet className="w-4 h-4 text-amber-600" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 mt-1">staff_strength.csv</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              250 records detailing sanctioned posts, active strength, and vacancies across police ranks.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-slate-500 font-mono text-[10px]">250 rows &bull; 5 cols</span>
            <button
              onClick={() => handleDownloadCsv('staff_strength')}
              className="inline-flex items-center space-x-1 text-amber-700 font-bold bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded border border-amber-200 text-xs transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Warehouse Interactive Console */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Navigation Tabs for Step 3 */}
        <div className="border-b border-slate-200 bg-slate-50 px-5 pt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveSubTab('rollup')}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-t-lg text-xs font-bold transition-all border-b-2 ${
                activeSubTab === 'rollup'
                  ? 'bg-white text-purple-700 border-purple-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>1. OLAP Roll-Up (All Station Totals)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('pivot')}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-t-lg text-xs font-bold transition-all border-b-2 ${
                activeSubTab === 'pivot'
                  ? 'bg-white text-purple-700 border-purple-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>2. OLAP Pivot Table (10-Year Matrix)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('raw_tables')}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-t-lg text-xs font-bold transition-all border-b-2 ${
                activeSubTab === 'raw_tables'
                  ? 'bg-white text-purple-700 border-purple-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>3. Filterable SQL Fact & Dim Browser</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 pb-2">
            KTU S5 Module 1: Multidimensional Operations
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUB-TAB 1: OLAP ROLL-UP (All Station Annual Totals & Multi-Station View) */}
        {/* ========================================================================= */}
        {activeSubTab === 'rollup' && (
          <div className="p-5 space-y-5">
            {/* Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  OLAP Roll-Up: All Police Station Annual Crime Volumes
                </h3>
                <p className="text-xs text-slate-500">
                  Aggregating individual crime categories to station-level facts. Displays all 37 stations ranked by registered volume.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-slate-600">Select Year:</span>
                <select
                  value={rollupYear}
                  onChange={(e) => setRollupYear(Number(e.target.value))}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {[2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleDownloadCsv('olap_rollup')}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Roll-Up CSV</span>
                </button>
              </div>
            </div>

            {/* Top Stations Chart */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-700 mb-2">
                Top 8 Highest Crime Registration Stations in {rollupYear} (IPC vs SLL)
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topStationsChart} margin={{ top: 5, right: 15, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="IPC" fill="#6366f1" radius={[2, 2, 0, 0]} name="IPC Crimes" />
                    <Bar dataKey="SLL" fill="#0ea5e9" radius={[2, 2, 0, 0]} name="SLL Crimes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Roll-up Records Table */}
            <div className="overflow-x-auto max-h-96 border border-slate-200 rounded-lg">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 z-10 shadow-xs">
                  <tr>
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Police Station</th>
                    <th className="py-2.5 px-3">Sub-Division</th>
                    <th className="py-2.5 px-3 text-right">Total Crimes</th>
                    <th className="py-2.5 px-3 text-right">IPC Crimes</th>
                    <th className="py-2.5 px-3 text-right">SLL Crimes</th>
                    <th className="py-2.5 px-3 text-center">Active Staff</th>
                    <th className="py-2.5 px-3 text-right">Cases / Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {rollupLoading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">Loading station roll-up data...</td>
                    </tr>
                  ) : rollupData?.records.map((r) => (
                    <tr key={r.station_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 font-bold text-slate-400">#{r.rank}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{r.station_name}</td>
                      <td className="py-2 px-3 text-slate-500">{r.division || '—'}</td>
                      <td className="py-2 px-3 text-right font-black text-purple-700 font-mono">
                        {r.total_crimes.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-indigo-600">{r.ipc_crimes.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-mono text-sky-600">{r.sll_crimes.toLocaleString()}</td>
                      <td className="py-2 px-3 text-center font-mono">
                        {r.existing_staff > 0 ? (
                          <span className="font-semibold">{r.existing_staff}</span>
                        ) : (
                          <span className="text-slate-300 italic">—</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {r.cases_per_officer > 0 ? (
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            r.cases_per_officer >= 25.0
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : r.cases_per_officer >= 15.0
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {r.cases_per_officer} c/off
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div>Total Aggregated Volume in {rollupYear}: <strong className="text-slate-900">{rollupData?.total_crimes_aggregated.toLocaleString()}</strong> crimes across 37 stations</div>
              <div className="text-[11px] text-slate-400 italic">SLL = Special & Local Laws (NDPS, Abkari, Arms Act)</div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 2: OLAP PIVOT TABLE (Station x Year Matrix)                       */}
        {/* ========================================================================= */}
        {activeSubTab === 'pivot' && (
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  OLAP Pivot Table: Station × Year Historical Matrix (2014–2023)
                </h3>
                <p className="text-xs text-slate-500">
                  Cross-tabulation showing annual crime trajectories across all stations to evaluate 10-year patterns.
                </p>
              </div>

              <button
                onClick={() => handleDownloadCsv('olap_rollup')}
                className="inline-flex items-center space-x-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Matrix CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-96 border border-slate-200 rounded-lg">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 z-10 shadow-xs">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap bg-slate-100">Police Station</th>
                    <th className="py-2.5 px-3 whitespace-nowrap bg-slate-100">Sub-Division</th>
                    {pivotData?.years.map((y) => (
                      <th key={y} className="py-2.5 px-2 text-right font-mono bg-slate-100">{y}</th>
                    ))}
                    <th className="py-2.5 px-3 text-right bg-purple-50 text-purple-900 font-bold">10-Yr Avg</th>
                    <th className="py-2.5 px-3 text-right bg-purple-100 text-purple-950 font-black">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                  {pivotLoading ? (
                    <tr>
                      <td colSpan={15} className="py-8 text-center text-slate-400">Loading cross-tabulation matrix...</td>
                    </tr>
                  ) : pivotData?.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 font-sans font-bold text-slate-900 whitespace-nowrap">{row.station_name}</td>
                      <td className="py-2 px-3 font-sans text-slate-500 whitespace-nowrap">{row.division || '—'}</td>
                      {pivotData.years.map((y) => {
                        const val = row[y] || 0;
                        return (
                          <td key={y} className={`py-2 px-2 text-right ${val === 0 ? 'text-slate-300' : 'text-slate-700'}`}>
                            {val > 0 ? val.toLocaleString() : '0'}
                          </td>
                        );
                      })}
                      <td className="py-2 px-3 text-right font-bold text-purple-800 bg-purple-50/50">
                        {Math.round(row.average).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right font-black text-purple-900 bg-purple-100/50">
                        {row.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-TAB 3: RAW FACT & DIMENSION EXPLORER (With Filters for All Stations)  */}
        {/* ========================================================================= */}
        {activeSubTab === 'raw_tables' && (
          <div className="p-5 space-y-4">
            {/* Table Selection & Filter Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center space-x-2">
                <TableIcon className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Filterable SQL Table Browser
                  </h3>
                  <p className="text-xs text-slate-500">
                    Querying SQLite <code className="font-mono text-purple-700">{selectedTable}</code>
                  </p>
                </div>
              </div>

              {/* Table Switcher Pills */}
              <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg">
                {['crime_records', 'stations', 'staff_strength', 'city_macro_crimes'].map((t) => (
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

            {/* Dynamic Filter Controls (Solving user request: filter by station, year, and search) */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center space-x-1 text-slate-600 font-semibold">
                <Filter className="w-3.5 h-3.5 text-purple-600" />
                <span>Filters:</span>
              </div>

              {/* Station Filter */}
              {selectedTable === 'crime_records' && (
                <div className="flex items-center space-x-1">
                  <span className="text-slate-500">Station:</span>
                  <select
                    value={filterStation}
                    onChange={(e) => {
                      setFilterStation(e.target.value);
                      setPage(0);
                    }}
                    className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500 max-w-xs"
                  >
                    <option value="all">All 37 Stations</option>
                    {preview?.filter_options?.stations.map((st) => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Year Filter */}
              {selectedTable === 'crime_records' && (
                <div className="flex items-center space-x-1">
                  <span className="text-slate-500">Year:</span>
                  <select
                    value={filterYear}
                    onChange={(e) => {
                      setFilterYear(e.target.value);
                      setPage(0);
                    }}
                    className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="all">All Years (2014–2023)</option>
                    {preview?.filter_options?.years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Crime Category Filter */}
              {selectedTable === 'crime_records' && (
                <div className="flex items-center space-x-1">
                  <span className="text-slate-500">Category:</span>
                  <select
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setPage(0);
                    }}
                    className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="all">All Categories</option>
                    {preview?.filter_options?.categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Hide Zeros Toggle */}
              {selectedTable === 'crime_records' && (
                <label className="flex items-center space-x-1.5 cursor-pointer bg-white px-2 py-1 rounded-md border border-slate-300 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={hideZeros}
                    onChange={(e) => {
                      setHideZeros(e.target.checked);
                      setPage(0);
                    }}
                    className="rounded text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
                  />
                  <span className="text-slate-700 font-medium">Hide Zero-Count Offenses</span>
                </label>
              )}

              {/* Search text */}
              <div className="relative flex-1 min-w-[160px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Search crime head / station..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                  }}
                  className="w-full text-xs pl-7 pr-3 py-1 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Direct CSV Download for current table */}
              <button
                onClick={() => handleDownloadCsv(selectedTable)}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-purple-700 bg-white hover:bg-purple-50 px-2.5 py-1 rounded-md border border-purple-300 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export {selectedTable}.csv</span>
              </button>
            </div>

            {/* Table Data View */}
            <div className="overflow-x-auto max-h-96 border border-slate-200 rounded-lg">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 z-10 shadow-xs">
                  <tr>
                    {preview?.columns.map((col) => (
                      <th key={col} className="py-2.5 px-3 whitespace-nowrap bg-slate-100">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                  {loading ? (
                    <tr>
                      <td colSpan={preview?.columns.length || 5} className="py-8 text-center text-slate-400">
                        Loading database records...
                      </td>
                    </tr>
                  ) : preview?.rows.length === 0 ? (
                    <tr>
                      <td colSpan={preview?.columns.length || 5} className="py-8 text-center text-slate-400">
                        No records match the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    preview?.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/80">
                        {preview.columns.map((col) => (
                          <td key={col} className="py-2 px-3 whitespace-nowrap max-w-xs truncate">
                            {row[col] !== null && row[col] !== undefined ? (
                              col === 'case_count' ? (
                                <strong className="text-purple-700 font-bold">{String(row[col])}</strong>
                              ) : (
                                String(row[col])
                              )
                            ) : (
                              <span className="text-slate-300 font-sans italic">NULL</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Count Controls */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing rows {preview && preview.total_rows > 0 ? page * pageSize + 1 : 0} to{' '}
                {Math.min((page + 1) * pageSize, preview?.total_rows || 0)} of{' '}
                {preview?.total_rows.toLocaleString()} matching records
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
                  Page {page + 1} of {Math.max(1, totalPages)}
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
          </div>
        )}

        {/* Footer Navigation */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
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
