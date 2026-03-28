import { useState, useEffect } from "react";
import ImageUploadModal from "./ImageUploadModal";
import { HardDrive, Wifi } from "lucide-react";

const BINS = [
  { id: "BIN-101-W", sensor: 98, citizen: 95, status: "critical" },
  { id: "BIN-102",   sensor: 30, citizen: 40, status: "normal" },
  { id: "BIN-103",   sensor: 45, citizen: 45, status: "normal" },
  { id: "BIN-104",   sensor: 10, citizen: 10, status: "normal" },
];

const ZONES = [
  { zone: "Central Zone", fill: 72, critical: 2 },
  { zone: "East District", fill: 45, critical: 0 },
  { zone: "Industrial Area", fill: 88, critical: 4 },
];

export default function LiveBinStatus({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [selectedBin, setSelectedBin] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleBinClick = (binId: string) => {
    setSelectedBin(binId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBin(null);
  };

  const getBarColor = (val: number) => {
    if (val > 75) return "bg-[#D32F2F]";
    if (val > 50) return "bg-[#F59E0B]";
    return "bg-[#0D9488]"; // Teal
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] font-sans text-gray-900 selection:bg-[#0288D1]/20 selection:text-[#0288D1] flex flex-col">
      
      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer" onClick={() => onNavigate("citizen")}>
              <div className="w-8 h-8 rounded bg-[#0288D1] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                C
              </div>
              <span className="font-extrabold text-[#111827] hidden sm:block tracking-tight text-lg">
                Smart Civic Cleanup System
              </span>
            </div>
            <div className="flex items-center gap-6 hidden md:flex">
              <button onClick={() => onNavigate("citizen")} className="text-[15px] font-semibold text-gray-500 hover:text-[#0288D1] transition-colors">Dashboard</button>
              <button className="text-[15px] font-bold text-[#0288D1] border-b-2 border-[#0288D1] pt-1">City Map</button>
              <button onClick={() => onNavigate("community")} className="text-[15px] font-semibold text-gray-500 hover:text-[#0288D1] transition-colors">Community</button>
              <button className="text-sm font-bold text-gray-500 hover:text-gray-900 border border-gray-200 rounded px-2.5 py-1.5 transition-colors bg-gray-50 uppercase">हिंदी</button>
              <button onClick={() => onNavigate("login")} className="text-[15px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent">Logout</button>
            </div>
            <div className="md:hidden flex items-center">
              <button onClick={() => onNavigate("login")} className="text-sm font-bold text-red-600">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className={`flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        
        {/* PAGE HEADER */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
           <div>
             <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
               Bin Operations
             </h1>
             <p className="text-base text-gray-600 font-medium">
               Live IoT Sensor & Citizen Report Convergence Network
             </p>
           </div>
           <div className="bg-[#E8F5E9] text-[#2E7D32] text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-2.5 shadow-sm uppercase tracking-widest border border-green-200">
              <div className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] animate-pulse"></div> 
              LIVE SYNC ACTIVE
           </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* BIN CARDS (Left side, 2-column grid) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {BINS.map((bin, i) => {
              const isCritical = bin.status === "critical";
              return (
                <div 
                  key={bin.id} 
                  onClick={() => handleBinClick(bin.id)}
                  style={{ transitionDelay: `${i * 100}ms` }}
                  className={`bg-white border p-6 rounded-xl shadow-sm flex flex-col cursor-pointer hover:-translate-y-1 transition-all duration-500 relative overflow-hidden ${isCritical ? 'border-red-200 hover:shadow-md' : 'border-gray-200 hover:border-[#0288D1] hover:shadow-md'} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-extrabold text-xl text-gray-900 tracking-tight">{bin.id}</h3>
                    {isCritical && (
                      <span className="bg-[#FFEBEE] text-[#D32F2F] border border-[#FFCDD2] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
                        At Capacity
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-5">
                    {[
                      { label: "IoT Sensor Data", icon: Wifi, val: bin.sensor }, 
                      { label: "Citizen Reports", icon: HardDrive, val: bin.citizen }
                    ].map(r => (
                      <div key={r.label}>
                         <div className="flex justify-between items-center mb-2">
                           <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                             <r.icon size={12} className="text-gray-400" /> {r.label}
                           </span>
                           <span className={`text-sm font-black ${isCritical && r.val > 75 ? 'text-[#D32F2F]' : 'text-gray-900'}`}>{r.val}%</span>
                         </div>
                         <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                           <div 
                             className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarColor(r.val)}`} 
                             style={{ width: isVisible ? `${Math.max(r.val, 2)}%` : '0%' }} 
                           />
                         </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Last updated: <span className="text-gray-900">Just now</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ZONE DENSITY SUMMARY CARD (Right side, sticky) */}
          <div className="lg:col-span-1 sticky top-24">
            <div className={`bg-white border border-gray-200 p-8 rounded-xl shadow-sm flex flex-col transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
              <h3 className="text-xl font-extrabold text-gray-900 mb-8 tracking-tight">Zone Density Summary</h3>
              
              <div className="space-y-8 flex-1">
                {ZONES.map(z => (
                  <div key={z.zone} className="flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                       <span className="text-xs font-black text-gray-700 uppercase tracking-widest">{z.zone}</span>
                       {z.critical > 0 && <span className="text-[10px] bg-[#FFEBEE] text-[#D32F2F] font-black px-2.5 py-1 rounded-full border border-[#FFCDD2] uppercase tracking-widest">{z.critical} full bins</span>}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                        <div className={`h-full rounded-full transition-all duration-1000 delay-500 ease-out ${getBarColor(z.fill)}`} style={{ width: isVisible ? `${z.fill}%` : '0%' }} />
                      </div>
                      <div className="text-sm font-black text-gray-900 w-10 text-right">{z.fill}%</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-10 py-3.5 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-[15px] font-extrabold uppercase tracking-widest transition-all shadow-sm active:scale-95">
                Dispatch Active Trucks
              </button>
            </div>
          </div>

        </div>

        {/* Modal */}
        {selectedBin && (
          <ImageUploadModal
            binId={selectedBin}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        )}
      </div>

      {/* FOOTER */}
      <footer className="bg-[#F4F6F9] text-gray-800 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-3 tracking-tight">Smart Civic Cleanup System</h3>
            <p className="text-[15px] text-gray-500 font-medium max-w-xs">Join hands in keeping our city clean and green.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[11px] uppercase text-gray-400 tracking-widest">Quick Links</h4>
            <ul className="space-y-2 text-[15px] font-semibold text-gray-600">
              <li><button onClick={() => onNavigate("login")} className="hover:text-[#0288D1] transition-colors">Home</button></li>
              <li><button onClick={() => onNavigate("community")} className="hover:text-[#0288D1] transition-colors">Community</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[11px] uppercase text-gray-400 tracking-widest">Contact</h4>
            <ul className="space-y-2 text-[15px] font-medium text-gray-600">
              <li className="flex items-center gap-2">
                 <span className="w-5 text-gray-400 font-mono text-center">@</span>
                 support@smartcivic.com
              </li>
              <li className="flex items-center gap-2">
                 <span className="w-5 text-gray-400 font-mono text-center">P</span>
                 +1 800 123 4567
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}