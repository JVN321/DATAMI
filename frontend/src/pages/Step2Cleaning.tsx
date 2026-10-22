import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  GitMerge, 
  Layers, 
  ShieldAlert,
  SlidersHorizontal,
  Table
} from 'lucide-react';

interface Step2CleaningProps {
  onNextStep: () => void;
  onPrevStep: () => void;
}

export const Step2Cleaning: React.FC<Step2CleaningProps> = ({
  onNextStep,
  onPrevStep,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  Pipeline Step 2 of 5
                </span>
                <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  KTU S5 Data Mining Module 2 (PECST525)
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Data Cleaning, Preprocessing & Normalization
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Handling missing values, reconciling naming discrepancies, and constructing concept hierarchies.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-center">
            <button
              onClick={onPrevStep}
              className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Step 1</span>
            </button>
            <button
              onClick={onNextStep}
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
            >
              <span>Proceed to Step 3: Warehouse</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Preprocessing Pillars (Syllabus Module 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
          <div className="flex items-center space-x-2.5 text-slate-800 font-bold text-sm">
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span>1. Strict Zero vs. Missing (Null) Policy</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            In standard machine learning, assuming missing data is zero introduces severe bias. In DATAMI:
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside bg-slate-50 p-3 rounded-lg border border-slate-100">
            <li><strong>Verified 0</strong> is stored only when the official table published a specific row with value 0.</li>
            <li><strong>Missing Years (NULL)</strong> are never fabricated or linearly interpolated. Lagged feature engineering skips unobserved intervals.</li>
          </ul>
        </div>

        {/* Pillar 2 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
          <div className="flex items-center space-x-2.5 text-slate-800 font-bold text-sm">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <GitMerge className="w-4 h-4" />
            </div>
            <span>2. Station Naming Harmonization</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Different portals used divergent slugs, spaces, or phonetic spellings. Reconciled schema:
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside bg-slate-50 p-3 rounded-lg border border-slate-100">
            <li><code className="font-mono text-indigo-700">kannamali</code> reconciled with <code className="font-mono">Kannamaly PS</code></li>
            <li><code className="font-mono text-indigo-700">cheranelloor</code> reconciled with <code className="font-mono">Cheranalloor PS</code></li>
            <li><code className="font-mono text-indigo-700">harbourekmc</code> normalized to <code className="font-mono">Harbour PS (Kochi)</code></li>
          </ul>
        </div>

        {/* Pillar 3 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
          <div className="flex items-center space-x-2.5 text-slate-800 font-bold text-sm">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
              <Layers className="w-4 h-4" />
            </div>
            <span>3. Concept Hierarchy Generation</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Constructed multidimensional concept trees to support rollup/drilldown OLAP operations:
          </p>
          <div className="p-3 bg-slate-900 text-sky-300 font-mono text-[11px] rounded-lg shadow-inner">
            <div>State: Kerala</div>
            <div className="pl-3">&rarr; District: Ernakulam (City) / Ernakulam Rural</div>
            <div className="pl-6">&rarr; Sub-Division: Ernakulam, Mattancherry, Thrikkakara, Aluva</div>
            <div className="pl-9">&rarr; Station: Ernakulam Central, Kadavanthra, etc.</div>
          </div>
        </div>

        {/* Pillar 4 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
          <div className="flex items-center space-x-2.5 text-slate-800 font-bold text-sm">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <span>4. Discretization into Relative Risk Tiers</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Continuous raw annual incident counts are discretized into binary target labels using the historical metropolitan median:
          </p>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1">
            <div><strong>Median Baseline (&theta;):</strong> 824.5 annual registered cases</div>
            <div className="text-rose-700 font-semibold">&bull; Class 1 (Higher Relative Risk): Annual cases &ge; 824.5</div>
            <div className="text-sky-700 font-semibold">&bull; Class 0 (Lower Relative Risk): Annual cases &lt; 824.5</div>
          </div>
        </div>
      </div>

      {/* Before vs After Cleaning Comparative Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h3 className="font-bold text-base text-slate-900 mb-3 border-b border-slate-100 pb-2 flex items-center space-x-2">
          <Table className="w-4 h-4 text-indigo-600" />
          <span>Before vs. After Normalization Transformations</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Field Name</th>
                <th className="py-2.5 px-3">Raw Scraped Representation</th>
                <th className="py-2.5 px-3">Normalized Clean Schema</th>
                <th className="py-2.5 px-3">Purpose & Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">station_name</td>
                <td className="py-2.5 px-3 text-rose-600 font-mono text-[11px]">"Ernakulam Town  South" (double space)</td>
                <td className="py-2.5 px-3 text-emerald-700 font-mono text-[11px] font-bold">"Ernakulam Town South"</td>
                <td className="py-2.5 px-3 text-slate-500">Whitespace normalization and slug indexing</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">coordinates</td>
                <td className="py-2.5 px-3 text-rose-600 font-mono text-[11px]">L.marker([9.9871, 76.27595]) inside inline JS</td>
                <td className="py-2.5 px-3 text-emerald-700 font-mono text-[11px] font-bold">latitude: 9.9871, longitude: 76.2759</td>
                <td className="py-2.5 px-3 text-slate-500">Structured numeric geocodes for Leaflet layer</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">case_count</td>
                <td className="py-2.5 px-3 text-rose-600 font-mono text-[11px]">Empty table cell `&lt;td&gt;&lt;/td&gt;`</td>
                <td className="py-2.5 px-3 text-emerald-700 font-mono text-[11px] font-bold">NULL (Not imputed as zero)</td>
                <td className="py-2.5 px-3 text-slate-500">Prevents artificial skew in time series lags</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">staff_strength</td>
                <td className="py-2.5 px-3 text-rose-600 font-mono text-[11px]">Individual HTML table per rank</td>
                <td className="py-2.5 px-3 text-emerald-700 font-mono text-[11px] font-bold">sanctioned: 172, active: 159, vac: 13</td>
                <td className="py-2.5 px-3 text-slate-500">Relational aggregation for spree capacity model</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Navigation Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onPrevStep}
            className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Step 1: Extraction</span>
          </button>
          <button
            onClick={onNextStep}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <span>Proceed to Step 3: Warehouse & Exports</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
