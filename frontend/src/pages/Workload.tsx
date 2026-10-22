import React, { useEffect, useState } from 'react';
import { Users, AlertCircle, Info, Shield, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { WorkloadStation } from '../types';

export const WorkloadPage: React.FC = () => {
  const [workload, setWorkload] = useState<WorkloadStation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [districtFilter, setDistrictFilter] = useState<string>('all');

  useEffect(() => {
    setLoading(true);
    const distParam = districtFilter !== 'all' ? districtFilter : undefined;
    api.getWorkload(distParam)
      .then((res) => setWorkload(res))
      .catch((err) => console.error('Failed to load workload data:', err))
      .finally(() => setLoading(false));
  }, [districtFilter]);

  const totalSanctioned = workload.reduce((acc, s) => acc + s.sanctioned_staff, 0);
  const totalExisting = workload.reduce((acc, s) => acc + s.existing_staff, 0);
  const totalVacancies = workload.reduce((acc, s) => acc + s.vacancy_count, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner with Strict Data-Integrity Notice */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-sky-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Operational Staffing & Incident-Volume Analysis
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Observational analysis comparing official station officer strength against registered annual case volume.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-600">Filter District:</label>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
            >
              <option value="all">All Districts ({workload.length} stations)</option>
              <option value="Ernakulam">Kochi City Police</option>
              <option value="Ernakulam Rural">Ernakulam Rural</option>
            </select>
          </div>
        </div>

        {/* Methodology Caveat Alert */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
          <div>
            <strong className="font-semibold">Methodological Integrity Notice (Requirement 3E):</strong> Case-per-officer ratios are <span className="underline font-semibold">incident volume indicators</span> and do not constitute confirmed operational overload. Response times are omitted entirely because authentic response-time telemetry is not published in public police registries. We strictly refrain from synthesizing artificial response times.
          </div>
        </div>
      </div>

      {/* Aggregate Staffing Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Active Strength</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {totalExisting.toLocaleString()} <span className="text-xs font-normal text-slate-500">officers</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Across {workload.length} monitored stations</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Sanctioned Strength</span>
          <div className="text-2xl font-black text-slate-800 mt-1">
            {totalSanctioned.toLocaleString()} <span className="text-xs font-normal text-slate-500">posts</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Authorized government establishment</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Establishment Vacancies</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {totalVacancies.toLocaleString()} <span className="text-xs font-normal text-slate-500">vacancies</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {totalSanctioned > 0 ? `${((totalVacancies / totalSanctioned) * 100).toFixed(1)}% vacancy rate` : '0%'}
          </p>
        </div>
      </div>

      {/* Station Staffing Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h3 className="font-bold text-sm text-slate-800 mb-3 border-b border-slate-100 pb-2">
          Station Officer Capacity & Annual Registered Volume Indicators
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Police Station</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3 text-right">Sanctioned</th>
                <th className="py-2.5 px-3 text-right">Active</th>
                <th className="py-2.5 px-3 text-right">Vacancies</th>
                <th className="py-2.5 px-3 text-right">Latest Year Cases</th>
                <th className="py-2.5 px-3 text-right">Cases / Officer</th>
                <th className="py-2.5 px-3 text-center">Volume Indicator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {workload.map((s) => (
                <tr key={s.station_id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{s.station_name}</td>
                  <td className="py-2.5 px-3 text-slate-500">{s.division || s.district}</td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-600">{s.sanctioned_staff}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-800">{s.existing_staff}</td>
                  <td className="py-2.5 px-3 text-right">
                    {s.vacancy_count > 0 ? (
                      <span className="text-amber-700 font-medium">{s.vacancy_count} ({s.vacancy_percentage}%)</span>
                    ) : (
                      <span className="text-emerald-700">0%</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                    {s.latest_annual_cases.toLocaleString()} ({s.latest_reporting_year})
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                    {s.cases_per_active_officer}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.indicator_label === 'High Volume'
                        ? 'bg-rose-100 text-rose-800'
                        : s.indicator_label === 'Moderate Volume'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}>
                      {s.indicator_label}
                    </span>
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
