import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Building2, 
  Phone, 
  Users, 
  ShieldAlert, 
  TrendingUp, 
  FileText, 
  AlertCircle, 
  X, 
  ArrowLeft,
  Zap,
  Sliders,
  CheckCircle2,
  ExternalLink
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
import { Station, StationDetail, RiskPrediction, ReadinessStation } from '../types';

interface Step5MapDashboardProps {
  stations: Station[];
  selectedStationId: string;
  onSelectStation: (stationId: string) => void;
  onPrevStep: () => void;
}

export const Step5MapDashboard: React.FC<Step5MapDashboardProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  onPrevStep,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [stationDetail, setStationDetail] = useState<StationDetail | null>(null);
  const [riskData, setRiskData] = useState<Record<string, RiskPrediction>>({});
  const [readinessData, setReadinessData] = useState<Record<string, ReadinessStation>>({});
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [surgePct, setSurgePct] = useState<number>(50);
  const [threshold, setThreshold] = useState<number>(25.0);

  // Load predictions and readiness for all stations
  useEffect(() => {
    Promise.all([
      api.getRiskPredictions(),
      api.getReadiness(undefined, surgePct, threshold)
    ]).then(([predRes, readRes]) => {
      const pMap: Record<string, RiskPrediction> = {};
      predRes.predictions.forEach((p) => { pMap[p.station_id] = p; });
      setRiskData(pMap);

      const rMap: Record<string, ReadinessStation> = {};
      readRes.stations.forEach((r) => { rMap[r.station_id] = r; });
      setReadinessData(rMap);
    }).catch((err) => console.error('Failed to load map overlays:', err));
  }, [surgePct, threshold]);

  // Load detail whenever selectedStationId changes
  useEffect(() => {
    if (!selectedStationId) return;
    setLoadingDetail(true);
    api.getStationDetail(selectedStationId)
      .then((res) => {
        setStationDetail(res);
        setIsDrawerOpen(true);
      })
      .catch((err) => console.error('Error loading station detail:', err))
      .finally(() => setLoadingDetail(false));
  }, [selectedStationId]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [9.9816, 76.2799],
        zoom: 12,
        minZoom: 9,
        maxZoom: 18,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const filtered = stations.filter(
      (s) =>
        s.latitude &&
        s.longitude &&
        (selectedDistrict === 'all' || s.district === selectedDistrict)
    );

    filtered.forEach((st) => {
      const pred = riskData[st.id];
      const read = readinessData[st.id];
      const isSelected = st.id === selectedStationId;
      const isVulnerable = read?.readiness_tier === 'vulnerable';
      const isHighRisk = pred?.risk_tier === 'higher';

      // Pin Color: Red if Understaffed/Higher Risk, Amber if Moderate, Sky/Emerald if Ready
      const pinColor = isVulnerable ? '#e11d48' : isHighRisk ? '#f59e0b' : '#0284c7';

      const customIcon = L.divIcon({
        className: 'custom-station-pin',
        html: `
          <div style="
            background-color: ${pinColor};
            border: ${isSelected ? '3px solid #ffffff' : '2px solid #ffffff'};
            outline: ${isSelected ? '3px solid #0f172a' : '1px solid rgba(0,0,0,0.3)'};
            width: ${isSelected ? '34px' : '28px'};
            height: ${isSelected ? '34px' : '28px'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 8px -1px rgba(0, 0, 0, 0.4);
            color: #ffffff;
            font-size: ${isSelected ? '12px' : '10px'};
            font-weight: 800;
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            <span>PS</span>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([st.latitude!, st.longitude!], { icon: customIcon });

      marker.on('click', () => {
        onSelectStation(st.id);
        mapInstanceRef.current?.setView([st.latitude!, st.longitude!], 14, { animate: true });
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [stations, riskData, readinessData, selectedDistrict, selectedStationId]);

  return (
    <div className="space-y-4">
      {/* Top Banner & Navigation Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Pipeline Step 5 of 5 &bull; Final Dashboard
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                Interactive Geospatial Map & Station Intelligence
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onPrevStep}
              className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Step 4: ML & Readiness</span>
            </button>

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Stations ({stations.filter((s) => s.latitude).length} mapped)</option>
              <option value="Ernakulam">Kochi City Police</option>
              <option value="Ernakulam Rural">Ernakulam Rural</option>
            </select>
          </div>
        </div>

        {/* Notice */}
        <div className="mt-3 p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] text-slate-600 flex items-center justify-between">
          <span>&bull; Click any station marker on the map to inspect its full historical trends, ML risk rating, and crime spree readiness.</span>
          <span className="text-slate-400 italic">Markers represent physical station houses, not crime occurrence coordinates.</span>
        </div>
      </div>

      {/* Main Map Container with Interactive Side Drawer */}
      <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-md h-[600px] w-full flex">
        {/* Leaflet Map Canvas */}
        <div ref={mapContainerRef} className="h-full w-full z-0" />

        {/* Floating Map Legend */}
        <div className="absolute bottom-6 left-6 z-10 bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-1.5 max-w-xs pointer-events-auto">
          <div className="font-bold text-slate-800 border-b border-slate-100 pb-1">Station Status Legend</div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-600 border border-white flex-shrink-0"></span>
            <span className="text-slate-700 font-medium">Understaffed Alert / Critical Spree Vulnerability</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-white flex-shrink-0"></span>
            <span className="text-slate-700 font-medium">Higher Relative Risk (Decision Tree)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-sky-600 border border-white flex-shrink-0"></span>
            <span className="text-slate-700 font-medium">Ready & Resilient / Lower Risk</span>
          </div>
        </div>

        {/* Slide-out Station Detail Drawer (Requirement: Click station -> show details/trends/risk) */}
        {isDrawerOpen && stationDetail && (
          <div className="absolute top-0 right-0 h-full w-full sm:w-[450px] bg-white z-20 shadow-2xl border-l border-slate-200 overflow-y-auto p-5 transition-transform">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-sky-600" />
                <h3 className="font-extrabold text-base text-slate-900 truncate">
                  {stationDetail.metadata.name}
                </h3>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading station intelligence...</div>
            ) : (
              <div className="space-y-4 mt-4 text-xs">
                {/* Station Metadata Summary */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                  <div className="text-slate-600">
                    <strong className="text-slate-800">Address:</strong> {stationDetail.metadata.address}
                  </div>
                  {stationDetail.metadata.sho_name && (
                    <div className="text-slate-600">
                      <strong className="text-slate-800">SHO:</strong> {stationDetail.metadata.sho_name} {stationDetail.metadata.sho_phone && `(${stationDetail.metadata.sho_phone})`}
                    </div>
                  )}
                  <div className="text-slate-600">
                    <strong className="text-slate-800">Jurisdiction:</strong> {stationDetail.metadata.jurisdiction}
                  </div>
                </div>

                {/* 1. ML Crime Risk Rating */}
                {stationDetail.risk_prediction && (
                  <div className={`p-3.5 rounded-xl border ${
                    stationDetail.risk_prediction.risk_tier === 'higher'
                      ? 'bg-rose-50 border-rose-200'
                      : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                        Decision Tree Risk Rating
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border">
                        {Math.round((stationDetail.risk_prediction.confidence || 0) * 100)}% Confidence
                      </span>
                    </div>
                    <div className="text-base font-extrabold text-slate-900 mt-1">
                      {stationDetail.risk_prediction.risk_label}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                      {stationDetail.risk_prediction.decision_rationale}
                    </p>
                  </div>
                )}

                {/* 2. Crime Spree Readiness & Staffing Gauge (User Requirement) */}
                {readinessData[selectedStationId] && (
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-900 text-white space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] flex items-center">
                        <Zap className="w-3 h-3 mr-1" /> Crime Spree Readiness (+{surgePct}% Surge)
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        readinessData[selectedStationId].readiness_tier === 'vulnerable'
                          ? 'bg-rose-600 text-white'
                          : readinessData[selectedStationId].readiness_tier === 'moderate'
                          ? 'bg-amber-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}>
                        {readinessData[selectedStationId].readiness_label}
                      </span>
                    </div>

                    {/* Interactive Surge Selector in Drawer */}
                    <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 pl-1 font-medium">Surge Sim:</span>
                      {[25, 50, 100].map((s) => (
                        <button
                          key={s}
                          onClick={() => setSurgePct(s)}
                          className={`flex-1 py-0.5 rounded text-[10px] font-bold transition-all ${
                            surgePct === s
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          +{s}%
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-0.5">
                      <div>Active Strength: <strong className="text-white">{readinessData[selectedStationId].existing_staff}</strong> / {readinessData[selectedStationId].sanctioned_staff}</div>
                      <div>Vacancies: <strong className="text-amber-400">{readinessData[selectedStationId].vacancy_count}</strong> ({readinessData[selectedStationId].vacancy_percentage}%)</div>
                      <div>Baseline Caseload: <strong className="text-white">{readinessData[selectedStationId].baseline_cases_per_officer}</strong> c/off</div>
                      <div>Spree Caseload: <strong className="text-rose-400">{readinessData[selectedStationId].spree_cases_per_officer}</strong> c/off</div>
                    </div>

                    {readinessData[selectedStationId].vacancy_count > 0 && (
                      <div className="p-2 bg-emerald-950/70 border border-emerald-800 rounded-lg text-[10px] text-emerald-300 flex items-center justify-between">
                        <span>Staffing Mitigation:</span>
                        <strong>Filling {readinessData[selectedStationId].vacancy_count} vacancies → {readinessData[selectedStationId].cases_per_officer_if_vacancies_filled} c/off</strong>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                      <strong>Readiness Assessment:</strong> {readinessData[selectedStationId].recommendation}
                    </div>
                  </div>
                )}

                {/* 3. Historical Crime Trends Chart (2014-2022) */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
                    <span>Annual Registered Cases (2014–2022)</span>
                  </div>
                  <div className="h-44 w-full">
                    {stationDetail.yearly_history && stationDetail.yearly_history.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stationDetail.yearly_history} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip formatter={(val: any) => [Number(val).toLocaleString(), 'Cases']} />
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                          <Line type="monotone" dataKey="total_cases" stroke="#0284c7" strokeWidth={2} name="Total Cases" dot={{ r: 2 }} />
                          <Line type="monotone" dataKey="ipc_cases" stroke="#8b5cf6" strokeWidth={1.5} name="IPC" dot={{ r: 1 }} />
                          <Line type="monotone" dataKey="sll_cases" stroke="#10b981" strokeWidth={1.5} name="SLL" dot={{ r: 1 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                        No continuous time series found.
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Top Crime Heads */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-2.5 bg-slate-100 font-bold text-slate-800 flex items-center justify-between">
                    <span>Top Offenses (IPC)</span>
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <table className="w-full text-left text-[11px]">
                    <tbody className="divide-y divide-slate-100">
                      {stationDetail.top_ipc_crime_heads.slice(0, 5).map((h, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2 text-slate-700">{h.crime_head}</td>
                          <td className="p-2 text-right font-bold text-slate-900">{h.total_count.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
