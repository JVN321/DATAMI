import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Overview } from './pages/Overview';
import { CrimeMap } from './pages/CrimeMap';
import { StationDetail } from './pages/StationDetail';
import { RiskPredictionPage } from './pages/RiskPrediction';
import { WorkloadPage } from './pages/Workload';
import { DataSourcesPage } from './pages/DataSources';
import { api } from './services/api';
import { Metadata, Station } from './types';
import { ShieldCheck, BookOpen } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('ernakulamcentral');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([api.getMetadata(), api.getStations()])
      .then(([metaRes, stationsRes]) => {
        setMetadata(metaRes);
        setStations(stationsRes);
        if (stationsRes.length > 0 && !selectedStationId) {
          setSelectedStationId(stationsRes[0].id);
        }
      })
      .catch((err) => console.error('Initialization error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectStation = (stationId: string) => {
    setSelectedStationId(stationId);
    setActiveTab('stations');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalStations={stations.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-3">
            <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600 text-sm font-medium">Loading DATAMI Analytics Engine & Real Datasets...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <Overview
                metadata={metadata}
                stations={stations}
                onSelectStation={handleSelectStation}
              />
            )}

            {activeTab === 'map' && (
              <CrimeMap
                stations={stations}
                onSelectStation={handleSelectStation}
              />
            )}

            {activeTab === 'stations' && (
              <StationDetail
                stations={stations}
                selectedStationId={selectedStationId}
                onSelectStation={setSelectedStationId}
              />
            )}

            {activeTab === 'prediction' && (
              <RiskPredictionPage
                onSelectStation={handleSelectStation}
              />
            )}

            {activeTab === 'workload' && (
              <WorkloadPage />
            )}

            {activeTab === 'sources' && (
              <DataSourcesPage metadata={metadata} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <span className="font-extrabold text-sm text-sky-400">DATAMI</span>
                <span className="text-slate-500">&bull;</span>
                <span className="text-slate-300 font-medium">
                  Data-mining Analytics & Temporal Assessment for Municipal Intelligence
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mt-1">
                Kochi Police Station Crime Analytics & Decision-Tree Prediction Platform &bull; KTU S5 Syllabus PECST525
              </p>
            </div>

            <div className="flex items-center space-x-6 text-slate-400">
              <button
                onClick={() => setActiveTab('sources')}
                className="hover:text-sky-400 transition-colors flex items-center space-x-1"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Documentation (docs/)</span>
              </button>
              <span className="text-slate-600">&bull;</span>
              <span className="text-emerald-400 font-medium flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Real Traceable Data</span>
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-slate-500 text-[11px]">
            Historical observations officially published by the Kerala Police. Station markers denote physical station houses, not crime occurrences or jurisdiction polygons.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
