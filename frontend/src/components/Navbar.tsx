import React from 'react';
import { 
  DownloadCloud,
  Sparkles,
  Database,
  BrainCircuit,
  MapPin,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  totalStations?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, totalStations }) => {
  const steps = [
    { id: 'step1', stepNum: '1', label: 'Data Extraction', shortLabel: 'Extraction', icon: DownloadCloud },
    { id: 'step2', stepNum: '2', label: 'Cleaning & Normalization', shortLabel: 'Cleaning', icon: Sparkles },
    { id: 'step3', stepNum: '3', label: 'DB & CSV Export', shortLabel: 'Database', icon: Database },
    { id: 'step4', stepNum: '4', label: 'ML Risk & Readiness', shortLabel: 'ML & Spree', icon: BrainCircuit },
    { id: 'step5', stepNum: '5', label: 'Visual Map & Intel', shortLabel: 'Map & Intel', icon: MapPin },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => setActiveTab('step1')}
            title="Go to Step 1"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-wider text-sky-400">DATAMI</span>
                <span className="text-[10px] bg-sky-950 text-sky-300 px-2 py-0.5 rounded-full border border-sky-800 font-medium">
                  KTU S5 PECST525
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                5-Step Crime Mining & Station Readiness Pipeline
              </p>
            </div>
          </div>

          {/* Step-by-Step Pipeline Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {steps.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isPast = steps.findIndex(s => s.id === activeTab) > index;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md ring-2 ring-sky-400/40'
                      : isPast
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isActive 
                      ? 'bg-white text-sky-700' 
                      : isPast 
                      ? 'bg-slate-700 text-slate-300' 
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {item.stepNum}
                  </span>
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Badges */}
          <div className="hidden sm:flex items-center space-x-2 text-xs">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
              Official Data
            </span>
            {totalStations && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                <Database className="w-3 h-3 mr-1 text-slate-400" />
                {totalStations} Stations
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile / Compact Navigation Sub-bar */}
      <div className="lg:hidden flex overflow-x-auto py-2 px-3 space-x-1.5 bg-slate-800/95 border-t border-slate-700 scrollbar-none">
        {steps.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                isActive ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isActive ? 'bg-white text-sky-700' : 'bg-slate-700 text-slate-300'
              }`}>
                {item.stepNum}
              </span>
              <Icon className="w-3.5 h-3.5" />
              <span>{item.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
