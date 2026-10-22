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
  Sliders,
  HelpCircle,
  FileCode,
  Scale
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
  
  // Configurable Parameters for Crime Spree & Understaffing
  const [surgePct, setSurgePct] = useState<number>(50);
  const [workloadThreshold, setWorkloadThreshold] = useState<number>(25.0);

  const [showRules, setShowRules] = useState<boolean>(false);
  const [showFeatureExplainer, setShowFeatureExplainer] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getModelEvaluation(),
      api.getReadiness(undefined, surgePct, workloadThreshold)
    ])
      .then(([evalRes, readRes]) => {
        setEvaluation(evalRes);
        setReadiness(readRes);
      })
      .catch((err) => console.error('Failed to load ML readiness data:', err))
      .finally(() => setLoading(false));
  }, [surgePct, workloadThreshold]);

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
                  Supervised Classification & Operational Simulation
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Machine Learning Risk & Crime Spree Readiness
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Explainable CART Decision Tree risk prediction and configurable understaffing surge simulator.
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

      {/* ========================================================================= */}
      {/* SECTION 1: DETAILED DECISION TREE ARCHITECTURE (User Requirement)         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Decision Tree Architecture: Inputs, Outputs & Methodology
              </h3>
              <p className="text-xs text-slate-500">
                Formal specification of feature engineering, splitting criteria, and evaluation baselines.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowFeatureExplainer(!showFeatureExplainer)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {showFeatureExplainer ? 'Collapse Details' : 'Expand Details'}
          </button>
        </div>

        {showFeatureExplainer && (
          <div className="mt-4 space-y-4 text-xs">
            {/* Target Output (Y) */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4">
              <div className="font-bold text-indigo-950 flex items-center space-x-1.5 text-sm mb-1">
                <Scale className="w-4 h-4 text-indigo-700" />
                <span>Target Variable Output (Y): Binary Crime Risk Classification</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                The model predicts whether a police station will fall into <strong>Higher Relative Risk (Class 1)</strong> or <strong>Lower Relative Risk (Class 0)</strong> during the target reporting period.
                Stations registering in the upper tercile (top 33%) of historical crime volume across the metropolitan area (exceeding ~1,000 annual registered offenses) are classified as Higher Relative Risk, indicating stations requiring proactive patrol allocation.
              </p>
            </div>

            {/* Input Features (X) */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 text-xs text-rose-700">X₁: lag1_cases (T-1)</div>
                <div className="font-mono text-[10px] text-slate-500 mt-0.5">Prior Year Volume</div>
                <p className="text-slate-600 text-[11px] mt-1.5 leading-snug">
                  Total crime volume registered in year T-1. Captures immediate momentum and baseline activity.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 text-xs text-amber-700">X₂: lag2_cases (T-2)</div>
                <div className="font-mono text-[10px] text-slate-500 mt-0.5">Two-Year Prior Volume</div>
                <p className="text-slate-600 text-[11px] mt-1.5 leading-snug">
                  Total crime volume registered in year T-2. Provides medium-term temporal stability.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 text-xs text-sky-700">X₃: rolling_2yr_avg</div>
                <div className="font-mono text-[10px] text-slate-500 mt-0.5">(T-1 + T-2) / 2</div>
                <p className="text-slate-600 text-[11px] mt-1.5 leading-snug">
                  Smoothed two-year moving average, filtering out transient single-year shocks or spikes.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 text-xs text-purple-700">X₄: trend_rate</div>
                <div className="font-mono text-[10px] text-slate-500 mt-0.5">(lag1 - lag2) / (lag2 + 1)</div>
                <p className="text-slate-600 text-[11px] mt-1.5 leading-snug">
                  Velocity of crime registration. A positive rate indicates accelerating registrations.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 text-xs text-emerald-700">X₅: sll_ratio</div>
                <div className="font-mono text-[10px] text-slate-500 mt-0.5">SLL / Total Crimes</div>
                <p className="text-slate-600 text-[11px] mt-1.5 leading-snug">
                  Proportion of Special & Local Laws (NDPS narcotics, Abkari liquor, Arms Act). Indicates vice activity.
                </p>
              </div>
            </div>

            {/* Hyperparameters & Strict Temporal Split */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px]">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <strong>Splitting Metric:</strong> Gini Impurity (CART)
                <div className="text-slate-500 text-[10px] font-mono mt-0.5">I_G(p) = 1 - Σ p_i²</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <strong>Tree Depth:</strong> Max Depth 3
                <div className="text-slate-500 text-[10px] mt-0.5">Strictly limited for human auditability</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <strong>Train / Test Split:</strong> Chronological
                <div className="text-slate-500 text-[10px] mt-0.5">Train: 2016–2019, Test: 2020–2025 (No leakage)</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: CONFIGURABLE CRIME SPREE & UNDERSTAFFING SIMULATOR              */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-6 shadow-md border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">
                Configurable Crime Spree & Understaffing Surge Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Simulate operational strain if a crime spree occurs. Adjust both the <strong>Crime Spree Surge %</strong> and the <strong>Workload Capacity Threshold</strong> to test readiness dynamically.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-emerald-400 font-semibold bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
              Live Dynamic Recalculation
            </span>
          </div>
        </div>

        {/* Dual Interactive Sliders (User Requirement: Configurable!) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
          {/* Slider 1: Crime Spree Surge % */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-rose-400" />
                <span className="font-bold text-sm text-slate-200">1. Crime Spree Surge Intensity:</span>
              </div>
              <span className="text-base font-extrabold text-rose-400 font-mono">
                +{surgePct}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="25"
              value={surgePct}
              onChange={(e) => setSurgePct(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>0% (Baseline)</span>
              <span>+25%</span>
              <span>+50% (Spree)</span>
              <span>+75%</span>
              <span>+100% (Crisis)</span>
              <span>+150%</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Simulated Volume = <code className="text-slate-300">Baseline Cases × (1 + {surgePct / 100})</code>
            </p>
          </div>

          {/* Slider 2: Configurable Workload Threshold */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5">
                <Scale className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm text-slate-200">2. Critical Workload Threshold:</span>
              </div>
              <span className="text-base font-extrabold text-amber-400 font-mono">
                {workloadThreshold} cases/officer
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="45"
              step="5"
              value={workloadThreshold}
              onChange={(e) => setWorkloadThreshold(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>15 (Strict)</span>
              <span>20</span>
              <span>25 (Standard)</span>
              <span>30</span>
              <span>35</span>
              <span>45 (Lenient)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Stations exceeding <strong className="text-amber-300">{workloadThreshold} cases/officer</strong> trigger an <strong className="text-rose-400">Understaffed Alert</strong>.
            </p>
          </div>
        </div>

        {/* Readiness Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-700/80">
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Assessed Stations</div>
            <div className="text-2xl font-black text-white mt-1">
              {readiness?.total_stations_assessed || 0}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Kochi & surrounding jurisdictions</div>
          </div>

          <div className="bg-rose-950/60 p-3.5 rounded-xl border border-rose-800/60">
            <div className="text-[11px] font-bold text-rose-300 uppercase flex items-center justify-between">
              <span>Understaffed Alerts</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400 mt-1">
              {readiness?.vulnerable_understaffed_count || 0}
            </div>
            <div className="text-[10px] text-rose-300 mt-0.5">Caseload exceeds {workloadThreshold} c/off</div>
          </div>

          <div className="bg-amber-950/60 p-3.5 rounded-xl border border-amber-800/60">
            <div className="text-[11px] font-bold text-amber-300 uppercase">Moderate Capacity</div>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {readiness?.moderate_capacity_count || 0}
            </div>
            <div className="text-[10px] text-amber-300 mt-0.5">Require patrol reserve mobilization</div>
          </div>

          <div className="bg-emerald-950/60 p-3.5 rounded-xl border border-emerald-800/60">
            <div className="text-[11px] font-bold text-emerald-300 uppercase flex items-center justify-between">
              <span>Ready & Resilient</span>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {readiness?.ready_resilient_count || 0}
            </div>
            <div className="text-[10px] text-emerald-300 mt-0.5">Ample officer headroom during spree</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: DECISION TREE EVALUATION & FEATURE IMPORTANCE                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Model Performance Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <h4 className="font-bold text-sm text-slate-900">Decision Tree Metrics</h4>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              CART Gini Depth 3
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <div className="text-[10px] text-slate-500 font-semibold">Test Accuracy</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">
                {evaluation ? `${Math.round(evaluation.metrics.accuracy * 100)}%` : '...'}
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <div className="text-[10px] text-slate-500 font-semibold">F1-Score</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">
                {evaluation ? `${Math.round(evaluation.metrics.f1_score * 100)}%` : '...'}
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <div className="text-[10px] text-slate-500 font-semibold">Precision</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">
                {evaluation ? `${Math.round(evaluation.metrics.precision * 100)}%` : '...'}
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <div className="text-[10px] text-slate-500 font-semibold">Recall</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">
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
            <span className="text-[10px] text-slate-500">Out-of-Time Test (2020–2025)</span>
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
            Zero future leakage test on actual post-2020 Kerala Police records.
          </p>
        </div>

        {/* Feature Importance Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <h4 className="font-bold text-sm text-slate-900">Feature Importance</h4>
            <span className="text-[10px] text-slate-500">Gini Reduction</span>
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

      {/* Human-Readable Decision Rules Drawer */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <button
          onClick={() => setShowRules(!showRules)}
          className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:text-rose-600 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-rose-500" />
            <span>Auditable If-Then Decision Rules (Extracted from Decision Tree Branches)</span>
          </div>
          {showRules ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showRules && evaluation?.decision_rules && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <pre className="font-mono text-[11px] bg-slate-900 text-slate-200 p-4 rounded-lg overflow-x-auto whitespace-pre leading-relaxed">
              {evaluation.decision_rules}
            </pre>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: STATION SPREE READINESS & UNDERSTAFFING TABLE                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Station Operational Readiness & Understaffing Analysis
            </h3>
            <p className="text-xs text-slate-500">
              Simulated under a <strong className="text-rose-600">+{surgePct}% crime spree</strong> with threshold <strong className="text-amber-600">{workloadThreshold} cases/officer</strong>
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
              <option value="all">All Tiers ({readiness?.stations.length || 0})</option>
              <option value="vulnerable">Understaffed Alert ({readiness?.vulnerable_understaffed_count || 0})</option>
              <option value="moderate">Moderate Only ({readiness?.moderate_capacity_count || 0})</option>
              <option value="ready">Ready & Resilient ({readiness?.ready_resilient_count || 0})</option>
            </select>
          </div>
        </div>

        {/* Stations Table */}
        <div className="overflow-x-auto mt-4 max-h-96">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="py-2.5 px-3">Police Station</th>
                <th className="py-2.5 px-3">Sub-Division</th>
                <th className="py-2.5 px-3 text-right">Baseline Cases</th>
                <th className="py-2.5 px-3 text-right">Spree (+{surgePct}%)</th>
                <th className="py-2.5 px-3 text-center">Active / Sanc</th>
                <th className="py-2.5 px-3 text-center">Vacancies</th>
                <th className="py-2.5 px-3 text-right">Spree Caseload</th>
                <th className="py-2.5 px-3 text-center">Readiness Status</th>
                <th className="py-2.5 px-3">Mitigation / Recommendation</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">Loading readiness data...</td>
                </tr>
              ) : filteredStations.map((st) => (
                <tr key={st.station_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-3 font-bold text-slate-900 whitespace-nowrap">{st.station_name}</td>
                  <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{st.division || '—'}</td>
                  <td className="py-2 px-3 text-right font-mono">{st.baseline_annual_cases.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-purple-700">
                    {st.spree_projected_cases.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-center font-mono">
                    <span className="font-semibold">{st.existing_staff}</span> / {st.sanctioned_staff}
                  </td>
                  <td className="py-2 px-3 text-center font-mono">
                    {st.vacancy_count > 0 ? (
                      <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                        {st.vacancy_count}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold">
                    <span className={st.spree_cases_per_officer >= workloadThreshold ? 'text-rose-600' : 'text-slate-800'}>
                      {st.spree_cases_per_officer} c/off
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      st.readiness_tier === 'vulnerable'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : st.readiness_tier === 'moderate'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {st.readiness_label}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[11px] text-slate-600 max-w-xs truncate" title={st.recommendation}>
                    {st.recommendation}
                  </td>
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => onSelectStation(st.station_id)}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:underline inline-flex items-center space-x-1"
                    >
                      <span>Map Intel</span>
                      <ArrowRight className="w-3 h-3" />
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
            <span>Proceed to Step 5: Visual Map & Station Intel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
