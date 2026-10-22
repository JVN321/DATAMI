import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Calendar, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  Info,
  Scale
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar 
} from 'recharts';

import { api } from '../services/api';
import { CrimeSummary, YearlyTrend, CrimeCategory, Station, Metadata } from '../types';
import { MetricCard } from '../components/MetricCard';
import { FilterBar } from '../components/FilterBar';

interface OverviewProps {
  metadata: Metadata | null;
  stations: Station[];
  onSelectStation: (stationId: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({ metadata, stations, onSelectStation }) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL_TOTAL');

  const [summary, setSummary] = useState<CrimeSummary | null>(null);
  const [trends, setTrends] = useState<YearlyTrend[]>([]);
  const [categories, setCategories] = useState<CrimeCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const yrParam = selectedYear !== 'all' ? parseInt(selectedYear) : undefined;
      const distParam = selectedDistrict !== 'all' ? selectedDistrict : undefined;
      const stParam = selectedStation !== 'all' ? selectedStation : undefined;

      const [sumRes, trendsRes, catsRes] = await Promise.all([
        api.getCrimeSummary({
          year: yrParam,
          district: distParam,
          station_id: stParam,
          crime_category: selectedCategory,
        }),
        api.getCrimeTrends({
          district: distParam,
          station_id: stParam,
        }),
        api.getCrimeCategories({
          year: yrParam,
          district: distParam,
          station_id: stParam,
          category_type: selectedCategory === 'SLL_TOTAL' ? 'SLL' : 'IPC',
        }),
      ]);

      setSummary(sumRes);
      setTrends(trendsRes);
      setCategories(catsRes);
    } catch (err) {
      console.error('Error loading overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDistrict, selectedStation, selectedYear, selectedCategory]);

  const handleResetFilters = () => {
    setSelectedDistrict('all');
    setSelectedStation('all');
    setSelectedYear('all');
    setSelectedCategory('ALL_TOTAL');
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="bg-sky-50 border-l-4 border-sky-600 p-4 rounded-r-xl shadow-sm flex items-start space-x-3">
        <Info className="w-5 h-5 text-sky-700 mt-0.5 flex-shrink-0" />
        <div className="text-xs sm:text-sm text-sky-900 leading-relaxed">
          <span className="font-bold">Historical Data Notice:</span> All figures displayed in this dashboard represent real historical case registrations (2014–2025) officially recorded by the Kerala Police. 
          They are <span className="underline font-semibold">not real-time crime reports</span>. Raw FIR registrations are influenced by reporting awareness, public campaigns (e.g. NDPS drives), and commercial commuter density.
        </div>
      </div>

      {/* Multidimensional OLAP Slicing Controls */}
      <FilterBar
        metadata={metadata}
        stations={stations}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        selectedStation={selectedStation}
        setSelectedStation={setSelectedStation}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onReset={handleResetFilters}
      />

      {/* Summary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Registered Cases"
          value={summary?.total_registered_cases ?? '...'}
          subtitle={
            summary
              ? `IPC: ${summary.ipc_cases.toLocaleString()} | SLL: ${summary.sll_cases.toLocaleString()}`
              : 'Aggregating...'
          }
          icon={FileText}
          badge={selectedCategory === 'ALL_TOTAL' ? 'All Laws' : selectedCategory}
          badgeColor="blue"
        />

        <MetricCard
          title="Reporting Stations"
          value={summary?.stations_represented ?? '...'}
          subtitle={`Across ${selectedDistrict === 'all' ? 'Kochi & Ernakulam' : selectedDistrict}`}
          icon={Building2}
          badge={selectedDistrict === 'all' ? 'Metropolitan' : selectedDistrict}
          badgeColor="emerald"
        />

        <MetricCard
          title="Reporting Scope"
          value={metadata?.reporting_period ?? '2014–2022'}
          subtitle={selectedYear !== 'all' ? `Filtered to Year: ${selectedYear}` : 'Continuous Historical Series'}
          icon={Calendar}
          badge="100% Real"
          badgeColor="slate"
        />

        <MetricCard
          title="Highest Volume Station"
          value={summary?.highest_station ? summary.highest_station.recorded_cases : '...'}
          subtitle={summary?.highest_station ? summary.highest_station.station_name : 'N/A'}
          icon={Scale}
          badge="Max Observation"
          badgeColor="amber"
          caveat={summary?.highest_station?.caveat}
        />
      </div>

      {/* Charts Section: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                <span>Annual Crime Volume Trends (2014–2023)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Breakdown between Indian Penal Code (IPC) and Special & Local Laws (SLL)
              </p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">
              Time Series
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip
                  formatter={(value: any) => [Number(value).toLocaleString(), 'Cases']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '0.5rem', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="total_cases" stroke="#0284c7" strokeWidth={2.5} name="Total Registered Cases" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="ipc_cases" stroke="#8b5cf6" strokeWidth={2} name="IPC Cases" dot={{ r: 2 }} />
                <Line type="monotone" dataKey="sll_cases" stroke="#10b981" strokeWidth={2} name="Special Laws (SLL)" dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-600 border border-slate-100">
            <strong>Empirical Data Mining Insight:</strong> Notice the sharp shift in registered cases during 2020–2021 corresponding to COVID-19 lockdown mobility restrictions across Kochi, followed by return to historical levels in 2022.
          </div>
        </div>

        {/* Crime Categories Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Crime-Category Distribution ({selectedCategory === 'SLL_TOTAL' ? 'SLL' : 'IPC'})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Top recorded offenses under official police classifications
              </p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-medium">
              Offense Breakdown
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categories.slice(0, 8)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis dataKey="crime_head" type="category" tick={{ fontSize: 11 }} stroke="#64748b" width={80} />
                <Tooltip
                  formatter={(value: any, name: any, props: any) => [
                    `${Number(value).toLocaleString()} cases (${props.payload.percentage}%)`,
                    'Count',
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '0.5rem', fontSize: '12px' }}
                />
                <Bar dataKey="case_count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Recorded Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-600 border border-slate-100 flex items-center justify-between">
            <span>Property & bodily offenses (Theft, Hurt, Burglary) form the primary historical baseline.</span>
            <span className="text-indigo-600 font-semibold cursor-pointer" onClick={() => setSelectedCategory(selectedCategory === 'SLL_TOTAL' ? 'IPC_TOTAL' : 'SLL_TOTAL')}>
              Switch to {selectedCategory === 'SLL_TOTAL' ? 'IPC' : 'SLL'} &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* Police Station Volume Table / Ranking */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Police Station Case Registrations & Jurisdiction Coverage
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing authentic historical counts and officer strength for {stations.length} stations
            </p>
          </div>
          <span className="text-xs text-slate-500 italic">
            Click on any station to view historical trend & risk profile
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Police Station</th>
                <th className="py-2.5 px-3">Sub-Division / District</th>
                <th className="py-2.5 px-3 text-right">Sanctioned Staff</th>
                <th className="py-2.5 px-3 text-right">Active Staff</th>
                <th className="py-2.5 px-3 text-right">Vacancies</th>
                <th className="py-2.5 px-3 text-right">Total Recorded Cases</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stations.map((st) => (
                <tr
                  key={st.id}
                  className="hover:bg-sky-50/60 cursor-pointer transition-colors"
                  onClick={() => onSelectStation(st.id)}
                >
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {st.name}
                    {st.district === 'Ernakulam' && (
                      <span className="ml-2 text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-normal">
                        Kochi City
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-xs">
                    {st.division || st.district}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-600">
                    {st.sanctioned_staff > 0 ? st.sanctioned_staff : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                    {st.existing_staff > 0 ? st.existing_staff : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-xs">
                    {st.vacancy_staff > 0 ? (
                      <span className="text-amber-700 font-medium">{st.vacancy_staff}</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    {st.total_cases_recorded ? st.total_cases_recorded.toLocaleString() : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStation(st.id);
                      }}
                      className="text-xs text-sky-600 hover:text-sky-800 font-semibold"
                    >
                      Analyze &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
