import React, { useEffect, useState } from 'react';
import { 
  BrainCircuit, 
  ArrowRight, 
  ArrowLeft, 
  Users, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle, 
  GitBranch, 
  ChevronDown, 
  ChevronUp,
  Search,
  Zap,
  Sliders
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
import { ModelEvaluation, ReadinessResponse, ReadinessStation } from '../types';

interface Step4MachineLearningProps {
  onNextStep: () => void;
  onPrevStep: () => void;
  onSelectStation: (stationId: string) => void;
}

export const Step4MachineLearning: React.FC<Step4MachineLearningProps> = ({
  onNextStep,
  onPrevStep,
  onSelectStation,
}) => {
  const [evaluation, setEvaluation] = useState<ModelEvaluation | null>(null);
  const [readiness, setReadiness] = useState<ReadinessResponse | null>(null);
  const [surgePct, setSurgePct] = useState<number>(50);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getModelEvaluation(),
      api.getReadiness(undefined, surgePct)
    ])
      .then(([evalRes, readRes]) => {
        setEvaluation(evalRes);
        setReadiness(readRes);
      })
      .catch((err) => console.error('Failed to load ML readiness data:', err))
      .finally(() => setLoading(false));
  }, [surgePct]);

  const featureImportanceData = evaluation?.feature_importances
    ? Object.entries(evaluation.feature_importances).map(([k, v]) => ({
        name: k.replace('_', ' ').toUpperCase(),
        importance: Math.round(v * 100),
      }))
    : [];

  const filteredStations = readiness?.stations.filter((s) => {
    const matchesSearch = s.station_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'all' || s.readiness_tier === tierFilter;
    return matchesSearch && matchesTier;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 flex-shrink-0">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  Pipeline Step 4 of 5
                </span>
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Decision Tree & Surge Readiness Simulation
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Machine Learning Risk & Crime Spree Readiness
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Classifying station risk & simulating whether police stations are understaffed to handle potential crime sprees.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-center">
            <button
              onClick={onPrevStep}
              className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Step 3</span>
            </button>
            <button
              onClick={onNextStep}
              className="inline-flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
            >
              <span>Proceed to Step 5: Map Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Part 1: Interactive Crime Spree Surge Simulator (User Requirement) */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-6 shadow-md border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">
                Crime Spree & Surge Readiness Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Simulate operational strain if a localized crime spree occurs. Analyzes whether stations have sufficient active officer capacity to manage elevated case volumes.
            </p>
          </div>

          {/* Interactive Surge Selector */}
          <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-700">
            {[
              { val: 25, label: '+25% Surge' },
              { val: 50, label: '+50% Major Spree' },
              { val: 100, label: '+100% Extreme Crisis' }
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => setSurgePct(opt.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  surgePct === opt.val
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Readiness KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="bg-slate-800/90 p-4 rounded-xl border border-rose-500/30">
            <span className="text-xs uppercase tracking-wider text-rose-300 font-bold flex items-center">
              <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-400" />
              Understaffed Alert Stations
            </span>
            <div className="text-3xl font-black text-rose-400 mt-1">
              {readiness?.vulnerable_understaffed_count ?? '...'} <span className="text-xs text-slate-400 font-normal">of 37</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Workload exceeds 35 cases/officer under +{surgePct}% spree
            </p>
          </div>

          <div className="bg-slate-800/90 p-4 rounded-xl border border-amber-500/30">
            <span className="text-xs uppercase tracking-wider text-amber-300 font-bold flex items-center">
              <Sliders className="w-3.5 h-3.5 mr-1 text-amber-400" />
              Moderate Capacity Stations
            </span>
            <div className="text-3xl font-black text-amber-400 mt-1">
              {readiness?.moderate_capacity_count ?? '...'} <span className="text-xs text-slate-400 font-normal">of 37</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Can manage baseline; requires reserve deployment during peak spree
            </p>
          </div>

          <div className="bg-slate-800/90 p-4 rounded-xl border border-emerald-500/30">
            <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              Ready & Resilient Stations
            </span>
            <div className="text-3xl font-black text-emerald-400 mt-1">
              {readiness?.ready_resilient_count ?? '...'} <span className="text-xs text-slate-400 font-normal">of 37</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Healthy officer headroom even under +{surgePct}% elevated criminality
            </p>
          </div>
        </div>
      </div>

      {/* Part 2: Decision Tree Model Performance (Module 3 Syllabus) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metrics Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <h4 className="font-bold text-sm text-slate-900">Decision Tree Evaluation</h4>
            <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">
              Gini CART
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500">Test Accuracy</span>
              <div className="text-xl font-black text-sky-600 mt-0.5">
                {evaluation ? `${Math.round(evaluation.metrics.accuracy * 100)}%` : '...'}
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500">Test F1-Score</span>
              <div className="text-xl font-black text-indigo-600 mt-0.5">
                {evaluation ? `${Math.round(evaluation.metrics.f1_score * 100)}%` : '...'}
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500">Precision</span>
              <div className="text-lg font-bold text-slate-800 mt-0.5">
                {evaluation ? `${Math.round(evaluation.metrics.precision * 100)}%` : '...'}
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500">Recall</span>
              <div className="text-lg font-bold text-slate-800 mt-0.5">
                {evaluation ? `${Math.round(evaluation.metrics.recall * 100)}%` : '...'}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Zero-R Majority Baseline:</span>
              <strong>{evaluation ? `${Math.round(evaluation.baselines.zero_r_majority.accuracy * 100)}%` : '...'}</strong>
            </div>
            <div className="flex justify-between">
              <span>Persistence (Lag-1) Baseline:</span>
              <strong>{evaluation ? `${Math.round(evaluation.baselines.persistence_lag1.accuracy * 100)}%` : '...'}</strong>
            </div>
          </div>
        </div>

        {/* Confusion Matrix Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <h4 className="font-bold text-sm text-slate-900">Confusion Matrix</h4>
            <span className="text-[10px] text-slate-500">Chronological Test</span>
          </div>

          {evaluation?.metrics.confusion_matrix && (
            <table className="w-full text-center text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-semibold">
                <tr>
                  <th className="p-1.5 border">Actual \ Pred</th>
                  <th className="p-1.5 border">Pred Lower</th>
                  <th className="p-1.5 border">Pred Higher</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-1.5 font-semibold bg-slate-50 border">Actual Lower</td>
                  <td className="p-1.5 bg-emerald-50 text-emerald-800 font-bold border">
                    TN: {evaluation.metrics.confusion_matrix[0][0]}
                  </td>
                  <td className="p-1.5 bg-rose-50 text-rose-800 font-bold border">
                    FP: {evaluation.metrics.confusion_matrix[0][1]}
                  </td>
                </tr>
                <tr>
                  <td className="p-1.5 font-semibold bg-slate-50 border">Actual Higher</td>
                  <td className="p-1.5 bg-amber-50 text-amber-800 font-bold border">
                    FN: {evaluation.metrics.confusion_matrix[1][0]}
                  </td>
                  <td className="p-1.5 bg-emerald-50 text-emerald-800 font-bold border">
                    TP: {evaluation.metrics.confusion_matrix[1][1]}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
          <p className="text-[11px] text-slate-500 mt-2 italic">
            Evaluated out-of-time on 2020–2025.
          </p>
        </div>

        {/* Feature Importance Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <h4 className="font-bold text-sm text-slate-900">Feature Importance</h4>
            <span className="text-[10px] text-slate-500">Gini Split</span>
          </div>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportanceData} layout="vertical" margin={{ top: 0, right: 15, left: 45, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={60} />
                <Tooltip formatter={(val: any) => [`${val}%`, 'Importance']} />
                <Bar dataKey="importance" fill="#f43f5e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Lag-1 volume and 2-year rolling average dominate predictions.
          </p>
        </div>
      </div>

      {/* Part 3: Station Spree Readiness & Staffing Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Station Operational Readiness & Understaffing Analysis
            </h3>
            <p className="text-xs text-slate-500">
              Evaluating capacity under a <strong className="text-rose-600">+{surgePct}% crime spree surge</strong>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search station..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium"
            >
              <option value="all">All Tiers</option>
              <option value="vulnerable">Understaffed Alert Only</option>
              <option value="moderate">Moderate Only</option>
              <option value="ready">Ready & Resilient Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Police Station</th>
                <th className="py-2.5 px-3 text-right">Active Staff</th>
                <th className="py-2.5 px-3 text-right">Vacancies</th>
                <th className="py-2.5 px-3 text-right">Baseline Ratio</th>
                <th className="py-2.5 px-3 text-right bg-rose-50 text-rose-900">+{surgePct}% Spree Ratio</th>
                <th className="py-2.5 px-3 text-right text-emerald-800">If Vacancies Filled</th>
                <th className="py-2.5 px-3 text-center">Spree Readiness Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStations.map((s) => (
                <tr key={s.station_id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-900">
                    {s.station_name}
                    <span className="block text-[10px] text-slate-400 font-normal">{s.division || s.district}</span>
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-slate-800">
                    {s.existing_staff} / {s.sanctioned_staff}
                  </td>
                  <td className="py-2 px-3 text-right">
                    {s.vacancy_count > 0 ? (
                      <span className="text-amber-700 font-bold">{s.vacancy_count}</span>
                    ) : (
                      <span className="text-emerald-700">0</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-medium">
                    {s.baseline_cases_per_officer} <span className="text-[10px] text-slate-400">c/off</span>
                  </td>
                  <td className="py-2 px-3 text-right font-bold bg-rose-50/50 text-rose-700">
                    {s.spree_cases_per_officer} <span className="text-[10px]">c/off</span>
                  </td>
                  <td className="py-2 px-3 text-right font-semibold text-emerald-700">
                    {s.cases_per_officer_if_vacancies_filled} <span className="text-[10px]">c/off</span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      s.readiness_tier === 'vulnerable'
                        ? 'bg-rose-100 text-rose-800'
                        : s.readiness_tier === 'moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {s.readiness_label}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={() => onSelectStation(s.station_id)}
                      className="text-xs text-sky-600 hover:text-sky-800 font-semibold"
                    >
                      Map &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onPrevStep}
            className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Step 3: Warehouse</span>
          </button>
          <button
            onClick={onNextStep}
            className="inline-flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <span>Proceed to Step 5: Final Map & Station Intelligence</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
