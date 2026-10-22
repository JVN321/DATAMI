import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Phone, 
  MapPin, 
  Users, 
  ShieldAlert, 
  TrendingUp, 
  FileText, 
  CheckCircle,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

import { api } from '../services/api';
import { Station, StationDetail as StationDetailType } from '../types';

interface StationDetailProps {
  stations: Station[];
  selectedStationId: string;
  onSelectStation: (stationId: string) => void;
}

export const StationDetail: React.FC<StationDetailProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
}) => {
  const [detail, setDetail] = useState<StationDetailType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!selectedStationId) return;
    setLoading(true);
    api.getStationDetail(selectedStationId)
      .then((res) => setDetail(res))
      .catch((err) => console.error('Failed to load station detail:', err))
      .finally(() => setLoading(false));
  }, [selectedStationId]);

  const currentStation = stations.find((s) => s.id === selectedStationId) || stations[0];

  return (
    <div className="space-y-6">
      {/* Top Station Selector & Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Building2 className="w-6 h-6 text-sky-600" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {currentStation?.name} Police Station
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {currentStation?.division || 'Police Sub-Division'} &bull; {currentStation?.district}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-600">Select Station:</label>
            <select
              value={selectedStationId}
              onChange={(e) => onSelectStation(e.target.value)}
              className="text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.district})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Station Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100 text-xs sm:text-sm">
          <div className="flex items-start space-x-2.5">
            <MapPin className="w-4 h-4 text-sky-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-slate-700 block">Verified Address:</span>
              <span className="text-slate-600 text-xs">{detail?.metadata.address || 'Kochi, Kerala'}</span>
            </div>
          </div>

          <div className="flex items-start space-x-2.5">
            <Phone className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-slate-700 block">Station House Officer:</span>
              <span className="text-slate-600 text-xs">
                {detail?.metadata.sho_name || 'Inspector of Police'}{' '}
                {detail?.metadata.sho_phone && `(${detail.metadata.sho_phone})`}
              </span>
            </div>
          </div>

          <div className="flex items-start space-x-2.5">
            <Users className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-slate-700 block">Staff Strength:</span>
              <span className="text-slate-600 text-xs">
                {detail?.metadata.existing_staff} Active / {detail?.metadata.sanctioned_staff} Sanctioned
                {detail && detail.metadata.vacancy_staff > 0 && (
                  <span className="text-amber-700 ml-1">({detail.metadata.vacancy_staff} vacancies)</span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-start space-x-2.5">
            <HelpCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-slate-700 block">Jurisdiction Scope:</span>
              <span className="text-slate-600 text-xs line-clamp-2">
                {detail?.metadata.jurisdiction || 'Territorial jurisdiction limits'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Tree Risk Prediction Badge */}
      {detail?.risk_prediction && (
        <div className={`rounded-xl p-5 border shadow-sm ${
          detail.risk_prediction.risk_tier === 'higher'
            ? 'bg-rose-50 border-rose-200'
            : 'bg-emerald-50 border-emerald-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                detail.risk_prediction.risk_tier === 'higher' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
                  Decision Tree Classifier Projection (Module 3 Syllabus)
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {detail.risk_prediction.risk_label}
                  <span className="text-xs font-semibold ml-2 px-2 py-0.5 rounded-full bg-white border text-slate-700">
                    Confidence: {Math.round((detail.risk_prediction.confidence || 0) * 100)}%
                  </span>
                </h3>
              </div>
            </div>

            <div className="text-xs text-slate-600 text-right">
              <div>Target Period: <strong>{detail.risk_prediction.target_period}</strong></div>
              <div>Baseline Year: <strong>{detail.risk_prediction.last_reporting_year}</strong></div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs text-slate-700">
            <strong>Decision Rationale:</strong> {detail.risk_prediction.decision_rationale}
          </div>
        </div>
      )}

      {/* Annual Trend Line Chart for Station */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              <span>Historical Registered Cases (2014–2022)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Annual case counts recorded at {currentStation?.name}
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">
            Station Time Series
          </span>
        </div>

        <div className="h-64 w-full">
          {detail?.yearly_history && detail.yearly_history.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={detail.yearly_history} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              No historical records available for this station.
            </div>
          )}
        </div>
      </div>

      {/* Crime Head Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IPC Crime Heads Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <h4 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Top Indian Penal Code (IPC) Heads</span>
            </h4>
            <span className="text-xs text-slate-500">Cumulative Recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2 px-3">Crime Classification Head</th>
                  <th className="py-2 px-3 text-right">Cumulative Cases</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {detail?.top_ipc_crime_heads.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-medium">{h.crime_head}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {h.total_count.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SLL Crime Heads Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <h4 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Special & Local Laws (SLL) Heads</span>
            </h4>
            <span className="text-xs text-slate-500">Cumulative Recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2 px-3">Enactment / Act Head</th>
                  <th className="py-2 px-3 text-right">Cumulative Cases</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {detail?.top_sll_crime_heads.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-medium">{h.crime_head}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {h.total_count.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
