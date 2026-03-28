import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Truck } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { onReportsUpdate, onTrucksUpdate } from "./src/services/databaseService";
import { useLiveUserLocation } from "./src/hooks/useLiveUserLocation";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const truckIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3067/3067332.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const reportIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/8155/8155106.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1004/1004601.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

function MapViewportController({ center }: { center: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;
    map.flyTo(center, Math.max(map.getZoom(), 14), { animate: true, duration: 1 });
  }, [center, map]);

  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 200);
    return () => window.clearTimeout(timer);
  }, [map]);

  return null;
}

export default function StaffMap({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [trucks, setTrucks] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const { location, error: locationError } = useLiveUserLocation(true);
  const userLocation = location ? ([location.lat, location.lng] as [number, number]) : null;
  const fallbackCenter: [number, number] = [19.9975, 73.7898];

  useEffect(() => {
    const unsubscribeTrucks = onTrucksUpdate((nextTrucks) => setTrucks(nextTrucks));
    const unsubscribeReports = onReportsUpdate((nextReports) => setReports(nextReports));

    return () => {
      unsubscribeTrucks();
      unsubscribeReports();
    };
  }, []);

  const activeTruckCount = useMemo(
    () => trucks.filter((truck) => truck.status === "active").length,
    [trucks]
  );

  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] font-sans text-gray-900 pb-12 animate-in fade-in duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex items-start gap-8 flex-col lg:flex-row">
        <div className="flex-1 w-full">
          <div className="mb-6">
            <button
              onClick={() => onNavigate("command")}
              className="flex items-center gap-2 text-gray-500 hover:text-[#0288D1] font-bold text-sm uppercase tracking-widest mb-6 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">City Map - Live Operations</h1>
            <p className="text-gray-500 font-medium text-lg mt-1">Real-time truck routes, complaint points, and your current GPS area.</p>
            {locationError && (
              <p className="text-sm font-bold text-red-600 mt-2">{locationError}</p>
            )}
          </div>

          <div className="relative w-full h-[600px] sm:h-[70vh] bg-[#F0F4F8] rounded-[16px] border border-gray-200 shadow-sm overflow-hidden z-0">
            <MapContainer center={userLocation ?? fallbackCenter} zoom={13} style={{ height: "100%", width: "100%", borderRadius: "16px" }}>
              <MapViewportController center={userLocation} />
              <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
                attribution="&copy; OpenStreetMap contributors"
              />

              {userLocation && (
                <Marker position={userLocation} icon={userIcon}>
                  <Popup><div className="font-bold text-blue-600">Your live GPS location</div></Popup>
                </Marker>
              )}

              {reports
                .filter((report) => report.latitude && report.longitude)
                .map((report) => (
                  <Marker
                    key={report.reportId || report.id}
                    position={[Number(report.latitude), Number(report.longitude)]}
                    icon={reportIcon}
                  >
                    <Popup>
                      <div className="font-sans">
                        <div className="font-bold text-red-600">{report.address || "Complaint location"}</div>
                        <div className="text-xs text-gray-600 mt-1">{report.description || "Citizen complaint"}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

              {trucks
                .filter((truck) => truck.latitude && truck.longitude)
                .map((truck) => (
                  <Marker
                    key={truck.truckId || truck.id}
                    position={[Number(truck.latitude), Number(truck.longitude)]}
                    icon={truckIcon}
                  >
                    <Popup>
                      <div className="font-sans">
                        <div className="font-bold text-green-600">{truck.driverName || truck.name || truck.truckId}</div>
                        <div className="text-xs text-gray-600 mt-1">{truck.status || "available"}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>

            <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur px-4 py-3 rounded-xl border border-gray-200 shadow-md flex flex-col gap-2 z-[400]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Your GPS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Complaint</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Truck</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 flex flex-col pt-14">
          <div className="bg-white rounded-[16px] border border-gray-200 shadow-sm p-6">
            <h3 className="text-xl font-extrabold text-gray-900 mb-6">Zone Summary</h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-blue-700">Live Complaints</span>
                  <span className="text-xs font-black bg-blue-50 text-blue-700 px-2 py-1 rounded">{reports.length}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, reports.length * 10)}%` }}></div></div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-green-700">Tracked Trucks</span>
                  <span className="text-xs font-black bg-green-50 text-green-700 px-2 py-1 rounded">{trucks.length}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full"><div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, trucks.length * 10)}%` }}></div></div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-amber-700">Active Trucks</span>
                  <span className="text-xs font-black bg-amber-50 text-amber-700 px-2 py-1 rounded">{activeTruckCount}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full"><div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, activeTruckCount * 15)}%` }}></div></div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <button className="w-full py-4 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-extrabold text-[13px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors active:scale-95">
                <Truck size={16} /> Dispatch Truck to Zone
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
