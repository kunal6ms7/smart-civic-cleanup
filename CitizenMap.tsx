import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Truck as TruckIcon } from "lucide-react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAllTrucks, onReportsUpdate } from "./src/services/databaseService";
import { useLiveUserLocation } from "./src/hooks/useLiveUserLocation";

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3067/3067332.png', // Green truck
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  className: 'truck-marker'
});

const reportIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/8155/8155106.png', // Red garbage bin
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1004/1004601.png', // User location
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

interface Truck {
  id?: string;
  truckId?: string;
  name?: string;
  driverName?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  assignedReportId?: string;
}

interface Report {
  id?: string;
  reportId?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  wasteType?: string;
  status?: string;
  address?: string;
  description?: string;
}

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

export default function CitizenMap({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [locationError, setLocationError] = useState("");
  const { location } = useLiveUserLocation(true);
  const animationFrameRef = useRef<number | null>(null);

  const userLocation = location ? [location.lat, location.lng] as [number, number] : null;

  useEffect(() => {
    const mergeTruckPositions = (nextTrucks: Truck[]) => {
      setTrucks((currentTrucks) => {
        const fromMap = new Map(
          currentTrucks.map((truck) => [truck.truckId || truck.id, truck])
        );
        const startedAt = performance.now();
        const duration = 900;

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        const animate = (timestamp: number) => {
          const progress = Math.min((timestamp - startedAt) / duration, 1);

          setTrucks(
            nextTrucks.map((nextTruck) => {
              const truckKey = nextTruck.truckId || nextTruck.id;
              const previousTruck = truckKey ? fromMap.get(truckKey) : undefined;
              const previousLat = Number(previousTruck?.latitude ?? nextTruck.latitude ?? 0);
              const previousLng = Number(previousTruck?.longitude ?? nextTruck.longitude ?? 0);
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
    };

    const loadTruckLocations = async () => {
      try {
        const nextTrucks = await getAllTrucks();
        mergeTruckPositions(nextTrucks);
      } catch (error) {
        console.error("Failed to fetch live truck locations:", error);
        setLocationError("Live truck feed is temporarily unavailable.");
      }
    };

    void loadTruckLocations();
    const truckPollId = window.setInterval(loadTruckLocations, 3000);

    const unsubscribeReports = onReportsUpdate((nextReports) => {
      setReports(nextReports);
    });

    return () => {
      window.clearInterval(truckPollId);
      unsubscribeReports();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const nearestTruckData = useMemo(() => {
    if (!userLocation || trucks.length === 0) {
      return {
        nearestTruck: null as Truck | null,
        distanceStr: "",
        etaMinutes: 0,
      };
    }

    let nearestTruck: Truck | null = null;
    let minDistance = Infinity;
    const userLatLng = L.latLng(userLocation[0], userLocation[1]);

    trucks.forEach((truck) => {
      if (!truck.latitude || !truck.longitude || truck.status !== "active") return;

      const truckLatLng = L.latLng(Number(truck.latitude), Number(truck.longitude));
      const distance = userLatLng.distanceTo(truckLatLng);

      if (distance < minDistance) {
        minDistance = distance;
        nearestTruck = truck;
      }
    });

    return {
      nearestTruck,
      distanceStr: nearestTruck ? `${(minDistance / 1000).toFixed(2)} km` : "",
      etaMinutes: nearestTruck ? Math.ceil((minDistance / 1000 / 30) * 60) : 0,
    };
  }, [trucks, userLocation]);

  const { nearestTruck, distanceStr, etaMinutes } = nearestTruckData;

  const defaultCenter: [number, number] = [19.9975, 73.7898];

  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] font-sans text-gray-900 pb-12 animate-in fade-in duration-150">
      <style>{`
        .truck-marker {
            transition: all 1s linear;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Header & Back Button */}
        <div className="mb-6">
          <button 
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-2 text-gray-500 hover:text-[#0288D1] font-bold text-sm uppercase tracking-widest mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Live Civic Map</h1>
              <p className="text-gray-500 font-medium text-lg mt-1">Track nearest garbage collection trucks and view public reports in real-time.</p>
            </div>
          </div>
        </div>

        {/* Live Status Card */}
        {nearestTruck ? (
            <div className="bg-white border border-blue-100 rounded-2xl shadow-sm p-5 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                       <TruckIcon size={24} />
                    </div>
                    <div>
                       <div className="text-[11px] font-bold uppercase tracking-widest text-[#0288D1] flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0288D1] animate-ping"></span> Nearest Truck Approaching</div>
                       <div className="text-xl font-extrabold text-gray-900">{nearestTruck.name}</div>
                    </div>
                </div>
                <div className="flex gap-8 items-center bg-gray-50 px-6 py-3 rounded-xl border border-gray-100">
                    <div>
                       <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Distance</div>
                       <div className="text-lg font-extrabold text-gray-900">{distanceStr}</div>
                    </div>
                    <div>
                       <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">ETA</div>
                       <div className="text-lg font-extrabold text-[#F59E0B]">{etaMinutes} mins</div>
                    </div>
                </div>
            </div>
        ) : userLocation ? (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-6 flex items-center gap-4">
               <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center"><TruckIcon size={24} /></div>
               <div><span className="font-extrabold text-gray-900">No active trucks</span> found near your location currently.</div>
            </div>
        ) : (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-6 flex items-center gap-4 text-gray-500 text-sm font-bold">
               {locationError || "Enable GPS to track the nearest waste collection truck."}
            </div>
        )}

        {/* Map Area */}
        <div className="relative w-full h-[600px] sm:h-[65vh] rounded-[16px] border border-gray-200 shadow-sm overflow-hidden flex items-center justify-center bg-[#F0F4F8] z-0">
          
          <MapContainer center={userLocation ?? defaultCenter} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '16px' }}>
            <MapViewportController center={userLocation} />
            <TileLayer
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              attribution="&copy; OpenStreetMap contributors"
            />
            
            {/* User Location */}
            {userLocation && (
                <Marker position={userLocation} icon={userIcon}>
                    <Popup><div className="font-bold text-center">You are here</div></Popup>
                </Marker>
            )}

            {/* Nearest Truck Connection Line */}
            {userLocation && nearestTruck && (
                <Polyline positions={[userLocation, [nearestTruck.latitude, nearestTruck.longitude]] as any} pathOptions={{ color: '#0288D1', dashArray: '8, 8', weight: 4, opacity: 0.6 }} />
            )}

            {/* Complaint markers */}
            {reports.filter((report) => report.latitude && report.longitude).map((report) => (
               <Marker position={[Number(report.latitude), Number(report.longitude)]} key={report.reportId || report.id} icon={reportIcon}>
                 <Popup>
                   <div className="font-sans">
                     <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{report.reportId || report.id}</div>
                     <div className="font-extrabold text-red-700 text-sm mb-2">{report.address || report.category || report.wasteType || "Complaint location"}</div>
                     <div className="text-xs text-gray-600 mb-2">{report.description || "Citizen complaint uploaded with image and GPS location."}</div>
                     <span className="inline-block px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded capitalize">{report.status || "pending"}</span>
                   </div>
                 </Popup>
               </Marker>
            ))}

            {/* Trucks */}
            {trucks.filter((truck) => truck.latitude && truck.longitude).map((truck) => (
               <Marker key={truck.truckId || truck.id} position={[Number(truck.latitude), Number(truck.longitude)]} icon={truckIcon}>
                  <Popup>
                     <div className="font-extrabold text-gray-900">{truck.driverName || truck.name || truck.truckId}</div>
                     <div className="text-xs text-gray-600 font-bold uppercase tracking-wider mt-1">{truck.status || "available"}</div>
                  </Popup>
               </Marker>
            ))}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur px-5 py-4 rounded-xl border border-gray-200 shadow-md flex flex-col gap-3 z-[400] text-xs font-bold">
             <div className="text-[9px] uppercase tracking-widest text-gray-400 font-black mb-1">Interactive Legend</div>
             <div className="flex items-center gap-3 text-gray-700">
               <img src={userIcon.options.iconUrl} className="w-5 h-5 object-contain" />
               Your Location
             </div>
             <div className="flex items-center gap-3 text-gray-700">
               <img src={truckIcon.options.iconUrl} className="w-5 h-5 object-contain" />
               Active Garbage Truck
             </div>
             <div className="flex items-center gap-3 text-gray-700">
               <img src={reportIcon.options.iconUrl} className="w-5 h-5 object-contain" />
               Citizen Report / Bin
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
