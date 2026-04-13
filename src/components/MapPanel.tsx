import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AgentResponse } from '../types';
import { Radar, Navigation, TrendingUp, AlertCircle, CheckCircle2, Info } from 'lucide-react';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPanelProps {
  agentResponse: AgentResponse | null;
}

function MapUpdater({ mapData }: { mapData: AgentResponse['map_data'] }) {
  const map = useMap();
  useEffect(() => {
    if (mapData && mapData.center) {
      map.setView([mapData.center[1], mapData.center[0]], mapData.zoom || 13);
    }
  }, [mapData, map]);
  return null;
}

export default function MapPanel({ agentResponse }: MapPanelProps) {
  if (!agentResponse) {
    return (
      <div className="flex-1 bg-slate-100 flex items-center justify-center">
        <div className="text-center text-slate-400 space-y-4">
          <Radar className="w-16 h-16 mx-auto opacity-50 animate-pulse" />
          <p className="text-lg font-medium">等待调度指令...</p>
        </div>
      </div>
    );
  }

  const { map_data, decision_card } = agentResponse;

  return (
    <div className="relative flex-1 h-full">
      <MapContainer
        center={[map_data.center[1], map_data.center[0]]}
        zoom={map_data.zoom || 13}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater mapData={map_data} />

        {map_data.polygons?.map((poly, idx) => (
          <Polygon
            key={`poly-${idx}`}
            positions={poly.path.map(p => [p[1], p[0]])}
            pathOptions={{
              color: poly.color || '#3b82f6',
              fillColor: poly.fillColor || poly.color || '#3b82f6',
              fillOpacity: 0.2,
              weight: 2,
            }}
          />
        ))}

        {map_data.routes?.map((route, idx) => (
          <Polyline
            key={`route-${idx}`}
            positions={route.path.map(p => [p[1], p[0]])}
            pathOptions={{ color: route.color || '#10b981', weight: 4, opacity: 0.8 }}
          />
        ))}

        {map_data.markers?.map((marker, idx) => (
          <Marker key={`marker-${idx}`} position={[marker.lat, marker.lng]}>
            <Popup className="font-sans">
              <span className="font-medium text-slate-800">{marker.label}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Decision Card Overlay */}
      <div className="absolute top-6 right-6 z-[1000] w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col max-h-[calc(100vh-3rem)]">
        <div className="p-4 bg-red-500 text-white flex items-center gap-3 shrink-0">
          <div className="p-2 bg-white/20 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-tight">{decision_card.title}</h3>
            <p className="text-xs text-red-100 mt-0.5 opacity-90">智能体决策结果</p>
          </div>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {decision_card.metrics && decision_card.metrics.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {decision_card.metrics.map((metric, idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
                    {metric.label}
                  </p>
                  <p className="text-sm font-bold text-slate-800 truncate" title={metric.value}>
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {decision_card.highlight_result && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-1">核心结论</p>
                <p className="text-sm font-bold text-emerald-900 leading-snug">
                  {decision_card.highlight_result}
                </p>
              </div>
            </div>
          )}

          {decision_card.recommendations && decision_card.recommendations.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-slate-400" />
                推荐方案
              </h4>
              <div className="space-y-2">
                {decision_card.recommendations.map((rec, idx) => (
                  <div key={idx} className="group relative pl-4 border-l-2 border-slate-200 hover:border-red-500 transition-colors py-1">
                    <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-slate-200 group-hover:bg-red-500 transition-colors" />
                    <p className="text-sm font-semibold text-slate-800">{rec.title}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rec.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
          <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            确认执行方案
          </button>
        </div>
      </div>
    </div>
  );
}
