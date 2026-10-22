import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { Metadata, Station } from '../types';

interface FilterBarProps {
  metadata: Metadata | null;
  stations: Station[];
  selectedDistrict: string;
  setSelectedDistrict: (val: string) => void;
  selectedStation: string;
  setSelectedStation: (val: string) => void;
  selectedYear: string;
  setSelectedYear: (val: string) => void;
  selectedCategory?: string;
  setSelectedCategory?: (val: string) => void;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  metadata,
  stations,
  selectedDistrict,
  setSelectedDistrict,
  selectedStation,
  setSelectedStation,
  selectedYear,
  setSelectedYear,
  selectedCategory,
  setSelectedCategory,
  onReset,
}) => {
  // Filter stations based on selected district
  const filteredStations = stations.filter(
    (s) => selectedDistrict === 'all' || s.district === selectedDistrict
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-slate-700 font-semibold text-sm">
          <Filter className="w-4 h-4 text-sky-600" />
          <span>Multidimensional OLAP Filters:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 md:max-w-4xl">
          {/* District Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">District Focus</label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedStation('all');
              }}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-700"
            >
              <option value="all">All Districts</option>
              {metadata?.filter_options.districts.map((d) => (
                <option key={d} value={d}>
                  {d} {d === 'Ernakulam' ? '(Kochi City)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Station Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Police Station</label>
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-700"
            >
              <option value="all">All Stations ({filteredStations.length})</option>
              {filteredStations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Reporting Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-700"
            >
              <option value="all">All Reporting Years</option>
              {metadata?.filter_options.years.map((y) => (
                <option key={y} value={y.toString()}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter if provided */}
          {setSelectedCategory && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Legal Category</label>
              <select
                value={selectedCategory || 'ALL_TOTAL'}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-700"
              >
                <option value="ALL_TOTAL">All Registered Cases</option>
                <option value="IPC_TOTAL">Indian Penal Code (IPC)</option>
                <option value="SLL_TOTAL">Special & Local Laws (SLL)</option>
              </select>
            </div>
          )}
        </div>

        <button
          onClick={onReset}
          className="flex items-center justify-center space-x-1.5 text-xs text-slate-600 hover:text-sky-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors font-medium self-end md:self-center"
          title="Reset all filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
