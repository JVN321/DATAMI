import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Station, RiskPrediction } from '../types';
import { api } from '../services/api';
import { MapPin, Info, AlertCircle, Shield, Phone, Map } from 'lucide-react';

interface CrimeMapProps {
  stations: Station[];
  onSelectStation: (stationId: string) => void;
}

export const CrimeMap: React.FC<CrimeMapProps> = ({ stations, onSelectStation }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [riskData, setRiskData] = useState<Record<string, RiskPrediction>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Load predictions for risk overlay
  useEffect(() => {
    api.getRiskPredictions()
      .then((res) => {
        const mapping: Record<string, RiskPrediction> = {};
        res.predictions.forEach((p) => {
          mapping[p.station_id] = p;
        });
        setRiskData(mapping);
      })
      .catch((err) => console.error('Failed to load risk predictions for map:', err))
      .finally(() => setLoading(false));
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Kochi coordinates: Lat 9.9816, Lon 76.2799
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

  // Update Markers when filters or data change
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
      const isHigherRisk = pred?.risk_tier === 'higher';
      const cases = st.total_cases_recorded || 0;

      // Color coding: Red for Higher Relative Risk / High volume, Blue/Emerald for Lower
      const bgColor = isHigherRisk ? '#e11d48' : '#0284c7';
      const borderColor = isHigherRisk ? '#9f1239' : '#0369a1';

      const customIcon = L.divIcon({
        className: 'custom-station-marker',
        html: `
          <div style="
            background-color: ${bgColor};
            border: 2px solid #ffffff;
            outline: 2px solid ${borderColor};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
          ">
            <span>PS</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 text-slate-800 text-xs sm:text-sm font-sans max-w-xs';
      popupContent.innerHTML = `
        <div class="border-b border-slate-200 pb-2 mb-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-base text-slate-900">${st.name}</span>
            <span class="text-[10px] px-2 py-0.5 rounded font-semibold ${
              isHigherRisk ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'
            }">
              ${pred ? pred.risk_label : 'Police Station'}
            </span>
          </div>
          <p class="text-xs text-slate-500">${st.division || st.district}</p>
        </div>

        <div class="space-y-1 text-xs text-slate-600 mb-3">
          <div><strong class="text-slate-700">Official Address:</strong> ${st.address || 'Kochi City Police limit'}</div>
          ${st.sho_name ? `<div><strong class="text-slate-700">SHO:</strong> ${st.sho_name} ${st.sho_phone ? `(${st.sho_phone})` : ''}</div>` : ''}
          <div><strong class="text-slate-700">Active Staff:</strong> ${st.existing_staff} / ${st.sanctioned_staff} officers</div>
          <div><strong class="text-slate-700">Total Recorded Cases:</strong> ${cases.toLocaleString()}</div>
        </div>

        <button 
          id="btn-inspect-${st.id}" 
          style="width: 100%; background-color: #0284c7; color: white; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; border: none;"
        >
          View Detailed Trends & Risk &rarr;
        </button>
      `;

      const marker = L.marker([st.latitude!, st.longitude!], { icon: customIcon });
      marker.bindPopup(popupContent);
      
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-${st.id}`);
        if (btn) {
          btn.onclick = () => onSelectStation(st.id);
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [stations, riskData, selectedDistrict]);

  return (
    <div className="space-y-4">
      {/* Top Map Banner & Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Map className="w-5 h-5 text-sky-600" />
            <span>Interactive Police Station Cartography — Kochi</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified station marker coordinates extracted directly from official Kerala Police Leaflet maps.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold text-slate-600">District Filter:</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Stations ({stations.filter((s) => s.latitude).length} mapped)</option>
            <option value="Ernakulam">Kochi City Police (Ernakulam)</option>
            <option value="Ernakulam Rural">Ernakulam Rural</option>
          </select>
        </div>
      </div>

      {/* Critical Cartographic Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start space-x-2.5">
        <AlertCircle className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
        <div>
          <strong className="font-semibold">Cartographic Jurisdiction Caveat:</strong> Map markers represent the physical police station buildings, <span className="underline">NOT specific street crime coordinates</span>. Station administrative jurisdiction boundaries are legal territorial divisions and are not implied by point coordinates. OpenStreetMap tiles are provided under ODbL license.
        </div>
      </div>

      {/* Map Canvas with Floating Legend */}
      <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-md h-[550px] w-full">
        <div ref={mapContainerRef} className="h-full w-full z-0" />

        {/* Floating Legend */}
        <div className="absolute bottom-6 right-6 z-10 bg-white/95 backdrop-blur-sm p-3.5 rounded-xl border border-slate-200 shadow-lg text-xs space-y-2 max-w-xs">
          <div className="font-bold text-slate-800 border-b border-slate-100 pb-1 flex items-center justify-between">
            <span>Map Marker Legend</span>
            <Shield className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-600 border border-white shadow-sm flex-shrink-0"></span>
            <span className="text-slate-700 font-medium">Higher Relative Risk (Decision Tree Projection)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded-full bg-sky-600 border border-white shadow-sm flex-shrink-0"></span>
            <span className="text-slate-700 font-medium">Lower Relative Risk (Decision Tree Projection)</span>
          </div>
          <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
            Tile data &copy; OpenStreetMap contributors
          </p>
        </div>
      </div>
    </div>
  );
};
