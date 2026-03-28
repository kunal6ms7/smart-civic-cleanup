import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, MapPin, Truck as TruckIcon } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getAllTrucks, onReportsUpdate } from "./src/services/databaseService";
import { useLiveUserLocation } from "./src/hooks/useLiveUserLocation";

const NASHIK_CENTER: [number, number] = [19.9975, 73.7898];

const truckIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3067/3067332.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const reportIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/8155/8155106.png",
  iconSize: [34, 34],
  iconAnchor: [17, 34],
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
    map.flyTo(center, Math.max(map.getZoom(), 15), { animate: true, duration: 1 });
  }, [center, map]);

  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 200);
    return () => window.clearTimeout(timer);
  }, [map]);

  return null;
}

export default function TrackTruck({ onNavigate: _onNavigate }: { onNavigate?: (page: string) => void }) {
  const [trucks, setTrucks] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [truckFeedError, setTruckFeedError] = useState("");
  const animationFrameRef = useRef<number | null>(null);
  const { location, status: locationStatus, error: locationError } = useLiveUserLocation(true);
  const userLocation = location ? [location.lat, location.lng] as [number, number] : null;

  useEffect(() => {
    const pollTruckLocations = async () => {
      try {
        const nextTrucks = await getAllTrucks();
        setTruckFeedError("");

        setTrucks((currentTrucks) => {
          const currentById = new Map(
            currentTrucks.map((truck) => [truck.truckId || truck.id, truck])
          );
          const startTime = performance.now();
          const duration = 900;

          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }

          const animate = (timestamp: number) => {
            const progress = Math.min((timestamp - startTime) / duration, 1);

            setTrucks(
              nextTrucks.map((nextTruck) => {
                const truckKey = nextTruck.truckId || nextTruck.id;
                const previousTruck = truckKey ? currentById.get(truckKey) : undefined;
                const previousLat = Number(previousTruck?.latitude ?? nextTruck.latitude ?? NASHIK_CENTER[0]);
                const previousLng = Number(previousTruck?.longitude ?? nextTruck.longitude ?? NASHIK_CENTER[1]);
                const targetLat = Number(nextTruck.latitude ?? previousLat);
                const targetLng = Number(nextTruck.longitude ?? previousLng);

                return {
                  ...previousTruck,
                  ...nextTruck,
                  latitude: previousLat + (targetLat - previousLat) * progress,
                  longitude: previousLng + (targetLng - previousLng) * progress,
                };
              })
            );

            if (progress < 1) {
              animationFrameRef.current = requestAnimationFrame(animate);
            }
          };

          animationFrameRef.current = requestAnimationFrame(animate);
          return currentTrucks;
        });
      } catch (error) {
        console.error("Failed to fetch truck locations:", error);
        setTruckFeedError("Truck live tracking feed is temporarily unavailable.");
      }
    };

    void pollTruckLocations();
    const pollId = window.setInterval(pollTruckLocations, 3000);
    const unsubscribeReports = onReportsUpdate((nextReports) => setReports(nextReports));

    return () => {
      window.clearInterval(pollId);
      unsubscribeReports();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const activeTruckCount = useMemo(
    () => trucks.filter((truck) => truck.status === "active").length,
    [trucks]
  );

  return (
    <div className="min-h-screen bg-[#F4F6F9] px-4 py-8 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Nashik Truck Tracking</h1>
            <p className="mt-2 text-base font-medium text-gray-600">
              Live complaint markers and garbage truck movement across Nashik.
            </p>
            {(truckFeedError || (locationStatus !== "ready" && locationError)) && (
              <p className="mt-2 text-sm font-bold text-[#D32F2F]">
                {truckFeedError || locationError}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Trucks</div>
              <div className="mt-1 text-2xl font-black text-[#0288D1]">{trucks.length}</div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Active</div>
              <div className="mt-1 text-2xl font-black text-[#2E7D32]">{activeTruckCount}</div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Complaints</div>
              <div className="mt-1 text-2xl font-black text-[#D32F2F]">{reports.length}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="h-[72vh] overflow-hidden rounded-2xl">
            <MapContainer center={NASHIK_CENTER} zoom={13} style={{ height: "100%", width: "100%" }}>
              <MapViewportController center={userLocation} />
              <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
                attribution="&copy; OpenStreetMap contributors"
              />

              {userLocation && (
                <Marker position={userLocation} icon={userIcon}>
                  <Popup>
                    <div className="space-y-1">
                      <div className="font-extrabold text-[#0288D1]">Your live GPS location</div>
                      <div className="text-xs font-medium text-gray-600">
                        {userLocation[0].toFixed(5)}, {userLocation[1].toFixed(5)}
                      </div>
                    </div>
                  </Popup>
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
                      <div className="space-y-1">
                        <div className="font-extrabold text-gray-900">{report.address || "Complaint Location"}</div>
                        <div className="text-xs font-medium text-gray-600">{report.description}</div>
                        <div className="text-[11px] font-black uppercase tracking-widest text-[#D32F2F]">
                          {report.status || "pending"}
                        </div>
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
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-extrabold text-gray-900">
                          <TruckIcon className="h-4 w-4 text-[#0288D1]" />
                          {truck.driverName || truck.name || truck.truckId}
                        </div>
                        <div className="text-[11px] font-black uppercase tracking-widest text-[#0288D1]">
                          {truck.status || "available"}
                        </div>
                        {truck.assignedReportId && (
                          <div className="text-xs font-medium text-gray-600">Assigned report: {truck.assignedReportId}</div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-gray-500">
              <TruckIcon className="h-4 w-4 text-[#0288D1]" />
              Truck Feed
            </div>
            <div className="space-y-3">
              {trucks.map((truck) => (
                <div key={truck.truckId || truck.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="font-extrabold text-gray-900">{truck.driverName || truck.name || truck.truckId}</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-500">
                    {Number(truck.latitude || NASHIK_CENTER[0]).toFixed(4)}, {Number(truck.longitude || NASHIK_CENTER[1]).toFixed(4)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-gray-500">
              <MapPin className="h-4 w-4 text-[#D32F2F]" />
              Complaint Response Feed
            </div>
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.reportId || report.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="font-extrabold text-gray-900">{report.address || "Nashik Complaint"}</div>
                  <div className="mt-1 text-sm font-medium text-gray-600">{report.description}</div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest">
                    <Activity className="h-4 w-4 text-[#0288D1]" />
                    {report.status || "pending"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
