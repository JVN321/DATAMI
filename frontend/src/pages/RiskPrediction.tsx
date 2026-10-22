import React, { useEffect, useState } from 'react';
import { 
  BrainCircuit, 
  ShieldAlert, 
  CheckCircle, 
  GitBranch, 
  Sliders, 
  Layers, 
  Award, 
  AlertCircle,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

import { api } from '../services/api';
import { ModelEvaluation, RiskPredictionResponse, RiskPrediction } from '../types';

interface RiskPredictionProps {
  onSelectStation: (stationId: string) => void;
}

export const RiskPredictionPage: React.FC<RiskPredictionProps> = ({ onSelectStation }) => {
  const [evaluation, setEvaluation] = useState<ModelEvaluation | null>(null);
  const [predictionsData, setPredictionsData] = useState<RiskPredictionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [showRules, setShowRules] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getModelEvaluation(), api.getRiskPredictions()])
      .then(([evalRes, predRes]) => {
        setEvaluation(evalRes);
        setPredictionsData(predRes);
      })
      .catch((err) => console.error('Error loading prediction data:', err))
      .finally(() => setLoading(false));
  }, []);

  const featureImportanceData = evaluation?.feature_importances
    ? Object.entries(evaluation.feature_importances).map(([k, v]) => ({
        name: k.replace('_', ' ').toUpperCase(),
        importance: Math.round(v * 100),
      }))
    : [];

  const filteredPredictions = predictionsData?.predictions.filter((p) => {
    const matchesSearch = p.station_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = riskFilter === 'all' || p.risk_tier === riskFilter;
    return matchesSearch && matchesTier;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 px-2.5 py-0.5 rounded-full font-semibold">
                KTU S5 Data Mining &bull; Module 3 (PECST525)
              </span>
              <span className="text-xs bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded-full font-medium">
                Decision Tree Induction
              </span>
            </div>
            <h2 className="text-2xl font-black mt-2 tracking-tight text-white flex items-center space-x-2">
              <BrainCircuit className="w-6 h-6 text-indigo-400" />
              <span>Explainable Crime Risk Classifier</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Predicts whether a police station will fall into a <strong>Higher Relative Risk</strong> or <strong>Lower Relative Risk</strong> tier 
              based exclusively on prior historical observations (lagged counts, trend rate, and SLL ratios).
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 text-xs">
            <div>
              <div className="text-slate-400">Higher Risk Stations</div>
              <div className="text-xl font-bold text-rose-400">
                {predictionsData?.higher_risk_count ?? '...'}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div>
              <div className="text-slate-400">Lower Risk Stations</div>
              <div className="text-xl font-bold text-sky-400">
                {predictionsData?.lower_risk_count ?? '...'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Training & Chronological Split Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs mb-2">
            <Sliders className="w-4 h-4 text-sky-600" />
            <span>Algorithm & Hyperparameters</span>
          </div>
          <div className="text-xs space-y-1.5 text-slate-600">
            <div><strong>Algorithm:</strong> CART Decision Tree</div>
            <div><strong>Impurity Metric:</strong> Gini Impurity (Syllabus Module 3)</div>
            <div><strong>Max Tree Depth:</strong> 3 (Guarantees explainability)</div>
            <div><strong>Min Samples Split:</strong> 4</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs mb-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Chronological Data Split</span>
          </div>
          <div className="text-xs space-y-1.5 text-slate-600">
            <div><strong>Train Window:</strong> {evaluation?.dataset_summary.train_years} ({evaluation?.dataset_summary.train_samples} samples)</div>
            <div><strong>Test Window:</strong> {evaluation?.dataset_summary.test_years} ({evaluation?.dataset_summary.test_samples} samples)</div>
            <div className="text-emerald-700 font-semibold">&check; Zero Data Leakage (No future shuffling)</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs mb-2">
            <Award className="w-4 h-4 text-purple-600" />
            <span>Target Label Definition</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {evaluation?.target_definition || 'Relative high/low threshold based on historical median volume.'}
          </p>
        </div>
      </div>

      {/* Evaluation Metrics & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Set Evaluation Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="font-bold text-sm text-slate-800 mb-3 border-b border-slate-100 pb-2">
            Test Evaluation Metrics (Chronological)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Test Accuracy</span>
              <div className="text-2xl font-black text-sky-700 mt-1">
                {evaluation ? `${Math.round(evaluation.metrics.accuracy * 100)}%` : '...'}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Test F1-Score</span>
              <div className="text-2xl font-black text-indigo-700 mt-1">
                {evaluation ? `${Math.round(evaluation.metrics.f1_score * 100)}%` : '...'}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Precision</span>
              <div className="text-xl font-bold text-slate-800 mt-1">
                {evaluation ? `${Math.round(evaluation.metrics.precision * 100)}%` : '...'}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Recall</span>
              <div className="text-xl font-bold text-slate-800 mt-1">
                {evaluation ? `${Math.round(evaluation.metrics.recall * 100)}%` : '...'}
              </div>
            </div>
          </div>

          {/* Baseline Comparisons */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
            <div className="font-semibold text-slate-700">Baseline Comparisons:</div>
            <div className="flex justify-between">
              <span>Zero-R (Majority Class):</span>
              <strong>{evaluation ? `${Math.round(evaluation.baselines.zero_r_majority.accuracy * 100)}%` : '...'}</strong>
            </div>
            <div className="flex justify-between">
              <span>Persistence (Lag-1 Volume):</span>
              <strong>{evaluation ? `${Math.round(evaluation.baselines.persistence_lag1.accuracy * 100)}%` : '...'}</strong>
            </div>
          </div>
        </div>

        {/* Confusion Matrix Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="font-bold text-sm text-slate-800 mb-3 border-b border-slate-100 pb-2">
            Confusion Matrix (Test Evaluation)
          </h3>
          {evaluation?.metrics.confusion_matrix && (
            <div className="space-y-3">
              <table className="w-full text-center text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-2 border">Actual \ Pred</th>
                    <th className="p-2 border">Pred Lower</th>
                    <th className="p-2 border">Pred Higher</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 font-semibold bg-slate-50 border">Actual Lower</td>
                    <td className="p-2 bg-emerald-50 text-emerald-800 font-bold border">
                      TN: {evaluation.metrics.confusion_matrix[0][0]}
                    </td>
                    <td className="p-2 bg-rose-50 text-rose-800 font-bold border">
                      FP: {evaluation.metrics.confusion_matrix[0][1]}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold bg-slate-50 border">Actual Higher</td>
                    <td className="p-2 bg-amber-50 text-amber-800 font-bold border">
                      FN: {evaluation.metrics.confusion_matrix[1][0]}
                    </td>
                    <td className="p-2 bg-emerald-50 text-emerald-800 font-bold border">
                      TP: {evaluation.metrics.confusion_matrix[1][1]}
                    </td>
                  </tr>
                </tbody>
              </table>

              <p className="text-[11px] text-slate-500 italic">
                * Evaluated on test years (2020–2025). Lockdowns in 2020–2021 created historical distribution shifts across Kerala police stations.
              </p>
            </div>
          )}
        </div>

        {/* Feature Importance Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="font-bold text-sm text-slate-800 mb-3 border-b border-slate-100 pb-2">
            Decision Tree Feature Importances
          </h3>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportanceData} layout="vertical" margin={{ top: 0, right: 20, left: 45, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={65} />
                <Tooltip formatter={(val: any) => [`${val}%`, 'Gini Importance']} />
                <Bar dataKey="importance" fill="#0284c7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Lagged volume and 2-year rolling average contribute the highest information gain.
          </p>
        </div>
      </div>

      {/* Decision Rules Collapsible */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <button
          onClick={() => setShowRules(!showRules)}
          className="flex items-center justify-between w-full text-left font-bold text-xs text-slate-800 hover:text-sky-600 transition-colors"
        >
          <span className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-sky-600" />
            <span>View Inducted Decision Tree Split Rules (CART / Gini Index)</span>
          </span>
          {showRules ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showRules && (
          <div className="mt-3 p-3 bg-slate-900 text-sky-300 font-mono text-xs rounded-lg overflow-x-auto shadow-inner">
            <pre>{evaluation?.decision_rules || 'No rules available.'}</pre>
          </div>
        )}
      </div>

      {/* Station Predictions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Station-Level Risk Predictions for Upcoming Period
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Relative risk category based on recent continuous lagged observation vectors
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
                className="text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium"
            >
              <option value="all">All Tiers</option>
              <option value="higher">Higher Risk Only</option>
              <option value="lower">Lower Risk Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Station</th>
                <th className="py-2.5 px-3">District / Division</th>
                <th className="py-2.5 px-3 text-center">Projected Risk Tier</th>
                <th className="py-2.5 px-3 text-right">Confidence</th>
                <th className="py-2.5 px-3">Explainable Rationale</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPredictions.map((p) => {
                const isHigh = p.risk_tier === 'higher';
                return (
                  <tr key={p.station_id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {p.station_name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {p.division || p.district}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        isHigh ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'
                      }`}>
                        {p.risk_label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium">
                      {p.confidence ? `${Math.round(p.confidence * 100)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-md">
                      {p.decision_rationale || p.explanation || 'Based on historical baseline counts.'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onSelectStation(p.station_id)}
                        className="text-sky-600 hover:text-sky-800 font-semibold"
                      >
                        Details &rarr;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Limitations Card */}
      <div className="bg-slate-100 rounded-xl p-5 border border-slate-200">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2 flex items-center space-x-1.5">
          <AlertCircle className="w-4 h-4 text-slate-500" />
          <span>Machine Learning Model Limitations & Disclaimers</span>
        </h4>
        <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
          {evaluation?.limitations.map((lim, i) => (
            <li key={i}>{lim}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
