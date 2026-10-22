import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Step1Extraction } from './pages/Step1Extraction';
import { Step2Cleaning } from './pages/Step2Cleaning';
import { Step3Warehouse } from './pages/Step3Warehouse';
import { Step4MachineLearning } from './pages/Step4MachineLearning';
import { Step5MapDashboard } from './pages/Step5MapDashboard';
import { api } from './services/api';
import { Metadata, Station } from './types';
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'step1';
  });
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
    setActiveTab('step5');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stepList = [
    { id: 'step1', num: 1, title: 'Data Extraction', subtitle: 'Raw Portal Harvesting' },
    { id: 'step2', num: 2, title: 'Cleaning & Normalization', subtitle: 'Zero-Policy & Taxonomy' },
    { id: 'step3', num: 3, title: 'DB & CSV Export', subtitle: 'SQLite & Downloadable CSV' },
    { id: 'step4', num: 4, title: 'ML Risk & Readiness', subtitle: 'Tree Model & Surge Sim' },
    { id: 'step5', num: 5, title: 'Map & Station Intel', subtitle: 'Interactive Map & Trends' },
  ];

  const currentStepIdx = stepList.findIndex((s) => s.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalStations={stations.length}
      />

      {/* Stepper Progress Bar Banner */}
      <div className="bg-white border-b border-slate-200 py-3 shadow-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 sm:space-x-4">
              {stepList.map((step, idx) => {
                const isActive = activeTab === step.id;
                const isPast = currentStepIdx > idx;
                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => setActiveTab(step.id)}
                      className={`flex items-center space-x-2 text-left group transition-all py-1 px-2 rounded-lg ${
                        isActive
                          ? 'bg-sky-50 text-sky-800'
                          : isPast
                          ? 'text-slate-700 hover:bg-slate-100'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-sky-600 text-white ring-2 ring-sky-300'
                            : isPast
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isPast ? '✓' : step.num}
                      </div>
                      <div>
                        <div className={`text-xs font-bold leading-tight ${isActive ? 'text-sky-900' : 'text-slate-700'}`}>
                          Step {step.num}: {step.title}
                        </div>
                        <div className="text-[10px] text-slate-400 hidden xl:block">
                          {step.subtitle}
                        </div>
                      </div>
                    </button>
                    {idx < stepList.length - 1 && (
                      <div className="w-6 sm:w-10 h-0.5 bg-slate-200 mx-1"></div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="text-right pl-4">
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                KDD Stage {currentStepIdx + 1} of 5
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-3">
            <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600 text-sm font-medium">Loading DATAMI Real Crime Datasets & ML Engines...</p>
          </div>
        ) : (
          <>
            {activeTab === 'step1' && (
              <Step1Extraction
                metadata={metadata}
                stations={stations}
                onNextStep={() => {
                  setActiveTab('step2');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {activeTab === 'step2' && (
              <Step2Cleaning
                onNextStep={() => {
                  setActiveTab('step3');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onPrevStep={() => {
                  setActiveTab('step1');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {activeTab === 'step3' && (
              <Step3Warehouse
                onNextStep={() => {
                  setActiveTab('step4');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onPrevStep={() => {
                  setActiveTab('step2');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {activeTab === 'step4' && (
              <Step4MachineLearning
                onNextStep={() => {
                  setActiveTab('step5');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onPrevStep={() => {
                  setActiveTab('step3');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectStation={handleSelectStation}
              />
            )}

            {activeTab === 'step5' && (
              <Step5MapDashboard
                stations={stations}
                selectedStationId={selectedStationId}
                onSelectStation={setSelectedStationId}
                onPrevStep={() => {
                  setActiveTab('step4');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
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
                  5-Step Data Mining Pipeline: Extraction &rarr; Cleaning &rarr; Warehouse &rarr; ML &rarr; Geospatial Intel
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mt-1">
                Kochi Police Station Crime Analytics & Decision-Tree Prediction Platform &bull; KTU S5 Syllabus PECST525
              </p>
            </div>

            <div className="flex items-center space-x-4 text-slate-400">
              <span className="text-emerald-400 font-medium flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Real Traceable Data</span>
              </span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-slate-400">
                {stations.length} Kochi Stations Ingested
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
