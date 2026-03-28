import { useEffect } from "react";
import { ArrowLeft, Map as MapIcon, Navigation2 } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "./LanguageContext";
import { useLiveUserLocation } from "./src/hooks/useLiveUserLocation";

export default function CityMap({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { t, language } = useLanguage();
  const { location, error: locationError } = useLiveUserLocation(true);

  useEffect(() => {
    const fallbackCenter: [number, number] = [19.9975, 73.7898];
    const initialCenter: [number, number] = location ? [location.lat, location.lng] : fallbackCenter;
    const map = L.map("map").setView(initialCenter, 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const marker = L.marker(initialCenter)
      .addTo(map)
      .bindPopup(location ? "Your live GPS location" : "Current tracking area")
      .openPopup();

    if (location) {
      map.setView([location.lat, location.lng], 15);
      marker.setLatLng([location.lat, location.lng]);
    }

    return () => {
      map.remove();
    };
  }, [location]);

  return (
    <div className={`min-h-[calc(100vh-140px)] bg-[#0B1121] flex flex-col relative ${language === "hi" ? "font-hindi" : ""}`}>
      <header className="flex items-center justify-between px-6 py-4 bg-[#0F172A]/80 backdrop-blur-md border border-[#38BDF8]/20 border-b border-[#38BDF8]/20 sticky top-0 z-20 shadow-[0_0_10px_rgba(56,189,248,0.1)]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate("citizen")}
            className="flex items-center gap-2 text-[#475569] hover:text-[var(--accent)] font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            {t("nav.home", "Back")}
          </button>
          <div className="h-6 w-px bg-[#334155]/50"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <MapIcon size={16} className="text-[var(--accent)]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--foreground)] leading-tight">{t("nav.track", "City Map")}</h1>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--success)]"></span>
                </span>
                <span className="text-[10px] uppercase font-semibold text-[#475569] tracking-wider">Live System Active</span>
              </div>
              {locationError && (
                <div className="mt-1 text-[11px] font-bold text-red-400">{locationError}</div>
              )}
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-xs font-semibold text-[var(--accent)] px-3 py-1 rounded-full bg-blue-50 border border-blue-100 uppercase tracking-wider">Live Tracking</span>
        </div>
      </header>

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full relative z-10">
        <div className="bg-[#0F172A]/80 backdrop-blur-md border border-[#38BDF8]/20 rounded-2xl shadow-[0_0_10px_rgba(56,189,248,0.1)] h-[calc(100vh-220px)] flex flex-col overflow-hidden">
          <div className="relative flex-1 bg-[#1E293B]/50 overflow-hidden">
            <div id="map" className="w-full h-full" />

            <div className="absolute top-6 left-6 bg-[#0F172A]/80 backdrop-blur-md border border-[#38BDF8]/20 p-5 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.3)] border border-[#1E293B] min-w-[200px] z-[500]">
              <div className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-4">Operations Status</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--success)]"></span>
                    <span className="text-sm font-medium text-[var(--foreground)]">Live GPS</span>
                  </div>
                  <span className="font-bold text-[var(--foreground)]">{location ? "Connected" : "Waiting"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span className="text-sm font-medium text-[var(--foreground)]">Map Source</span>
                  </div>
                  <span className="font-bold text-[var(--foreground)]">OpenStreetMap</span>
                </div>
                <div className="h-px bg-[#1E293B]/50 my-2"></div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-[var(--foreground)]">Center Mode</span>
                    <span className="font-bold text-[var(--success)]">{location ? "Live" : "Fallback"}</span>
                  </div>
                  <div className="w-full bg-[#1E293B]/50 rounded-full h-1.5">
                    <div className="bg-[var(--success)] h-1.5 rounded-full" style={{ width: location ? "100%" : "55%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-[500]">
              <button className="w-10 h-10 bg-[#0F172A]/80 backdrop-blur-md border border-[#38BDF8]/20 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.2)] border border-[#1E293B] flex items-center justify-center text-[#64748B] hover:text-[var(--accent)] hover:bg-[#0B1121] transition">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
              </button>
              <button className="w-10 h-10 bg-[#0F172A]/80 backdrop-blur-md border border-[#38BDF8]/20 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.2)] border border-[#1E293B] flex items-center justify-center text-[#64748B] hover:text-[var(--accent)] hover:bg-[#0B1121] transition">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>
              </button>
              <button className="w-10 h-10 bg-[var(--accent)] rounded-full shadow-[0_0_15px_rgba(56,189,248,0.2)] border border-[var(--accent)] text-white flex items-center justify-center hover:bg-blue-700 mt-2 transition">
                <Navigation2 size={18} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
