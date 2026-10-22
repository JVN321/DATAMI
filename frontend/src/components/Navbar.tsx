import React from 'react';
import { 
  BarChart3, 
  MapPin, 
  Building2, 
  BrainCircuit, 
  Users, 
  BookOpen, 
  ShieldCheck,
  Database
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  totalStations?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, totalStations }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'map', label: 'Interactive Map', icon: MapPin },
    { id: 'stations', label: 'Station Analysis', icon: Building2 },
    { id: 'prediction', label: 'Risk Prediction (ML)', icon: BrainCircuit },
    { id: 'workload', label: 'Staffing & Volume', icon: Users },
    { id: 'sources', label: 'Data Sources & Docs', icon: BookOpen },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-wider text-sky-400">DATAMI</span>
                <span className="text-xs bg-sky-950 text-sky-300 px-2 py-0.5 rounded-full border border-sky-800 font-medium">
                  PECST525 S5
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Kochi Police Station Crime Analytics & Prediction Platform
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Badges */}
          <div className="hidden lg:flex items-center space-x-3 text-xs">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
              Real Official Data
            </span>
            {totalStations && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                <Database className="w-3 h-3 mr-1 text-slate-400" />
                {totalStations} Stations
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Sub-bar */}
      <div className="md:hidden flex overflow-x-auto py-2 px-3 space-x-1 bg-slate-800/90 border-t border-slate-700 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                isActive ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
