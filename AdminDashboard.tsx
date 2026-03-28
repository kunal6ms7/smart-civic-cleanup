import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MapPin, Users, Truck, AlertTriangle, Activity, Award, CheckCircle, Clock, Map as MapIcon, BarChart2, TrendingUp, LogOut, Shield, LayoutDashboard, Database } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { onReportsUpdate } from "./src/services/databaseService";

const NASHIK_CENTER: [number, number] = [19.9975, 73.7898]; // Nashik coordinates

type TabType = "overview" | "map" | "complaints" | "staff" | "trucks" | "analytics";

const mockOverview = {
  feed: [
    { id: 1, user: "System", action: "Assigned Truck #4 to Sector 18", time: "2m", dot: "bg-gray-400" },
    { id: 2, user: "Pradyumna Tayade", action: "Resolved Complaint C-102", time: "5m", dot: "bg-[#2E7D32]" },
    { id: 3, user: "AI Node", action: "Detected Anomaly in Sector 44", time: "12m", dot: "bg-[#D32F2F]" }
  ]
};

const mockComplaints = [
  { id: "C-101", area: "Sector 44", priority: "HIGH", time: "10:45 AM", severity: "high" },
  { id: "C-102", area: "Sector 18", priority: "MEDIUM", time: "09:30 AM", severity: "medium" },
  { id: "C-103", area: "Sector 15", priority: "LOW", time: "08:45 AM", severity: "low" }
];

const mockStaff = [
  { id: "S-101", name: "Pradyumna Tayade", waste: 450, badges: ["Clean Hero", "Streak Master"], initial: "P" },
  { id: "S-102", name: "Milind Wani", waste: 320, badges: ["Waste Warrior"], initial: "M" },
  { id: "S-103", name: "Kunal Kanojiya", waste: 510, badges: ["City Clean Master"], initial: "K" }
];

const mockAnalytics = [
  { name: "Mon", waste: 4000 }, { name: "Tue", waste: 3000 }, { name: "Wed", waste: 2000 },
  { name: "Thu", waste: 2780 }, { name: "Fri", waste: 1890 }, { name: "Sat", waste: 2390 },
  { name: "Sun", waste: 3490 }
];

function TacticalMapPlaceholder() {
  const [toggles, setToggles] = useState({ bins: true, trucks: true, anomalies: true, operators: false });

  // Custom icons for map markers
  const binIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 7v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7H3z" fill="#22c55e"/>
        <path d="M3 5h18v2H3V5z" fill="#16a34a"/>
        <rect x="8" y="9" width="2" height="6" fill="#ffffff"/>
        <rect x="12" y="9" width="2" height="6" fill="#ffffff"/>
        <rect x="16" y="9" width="2" height="6" fill="#ffffff"/>
      </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });

  const truckIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="12" width="24" height="12" rx="2" fill="#3b82f6"/>
        <rect x="6" y="14" width="4" height="8" fill="#1e40af"/>
        <rect x="12" y="14" width="4" height="8" fill="#1e40af"/>
        <rect x="18" y="14" width="4" height="8" fill="#1e40af"/>
        <circle cx="8" cy="26" r="3" fill="#374151"/>
        <circle cx="24" cy="26" r="3" fill="#374151"/>
        <rect x="2" y="8" width="28" height="4" rx="1" fill="#6b7280"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  const operatorIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="8" r="4" fill="#3b82f6"/>
        <path d="M12 14c-4 0-7 2-7 4.5V20h14v-1.5c0-2.5-3-4.5-7-4.5z" fill="#3b82f6"/>
      </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });

  // Sample data for Nashik
  const bins = [
    { id: 'B-001', lat: 19.9975, lng: 73.7898, status: 'full' },
    { id: 'B-002', lat: 19.9920, lng: 73.7850, status: 'empty' },
    { id: 'B-003', lat: 20.0020, lng: 73.7940, status: 'full' },
    { id: 'B-004', lat: 19.9950, lng: 73.7820, status: 'empty' },
  ];

  const trucks = [
    { id: 'T-001', lat: 19.9980, lng: 73.7910, status: 'active' },
    { id: 'T-002', lat: 19.9940, lng: 73.7870, status: 'active' },
    { id: 'T-003', lat: 20.0000, lng: 73.7930, status: 'idle' },
  ];

  const operators = [
    { id: 'O-001', lat: 19.9960, lng: 73.7880, name: 'John Doe' },
    { id: 'O-002', lat: 19.9990, lng: 73.7920, name: 'Jane Smith' },
  ];

  const anomalies = [
    { id: 'A-001', lat: 19.9930, lng: 73.7860, severity: 'high' },
    { id: 'A-002', lat: 20.0010, lng: 73.7950, severity: 'medium' },
    { id: 'A-003', lat: 19.9955, lng: 73.7835, severity: 'low' },
  ];

  return (
    <div className="w-full flex items-start gap-8 flex-col lg:flex-row">
      {/* Map Area */}
      <div className="flex-1 w-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tactical Map — Nashik Command View</h2>
          <p className="text-gray-500 font-medium text-lg mt-1">Real-time geospatial overview of Nashik with live bin status, fleet positions, and anomaly detection</p>
        </div>
        <div className="relative w-full h-[600px] bg-white rounded-[16px] border border-gray-200 shadow-sm overflow-hidden">
          <MapContainer 
            center={NASHIK_CENTER} 
            zoom={14} 
            style={{ height: '100%', width: '100%' }}
            className="rounded-[16px]"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Anomaly Zones */}
            {toggles.anomalies && anomalies.map((anomaly) => (
              <Circle
                key={anomaly.id}
                center={[anomaly.lat, anomaly.lng]}
                radius={200}
                pathOptions={{
                  color: anomaly.severity === 'high' ? '#dc2626' : anomaly.severity === 'medium' ? '#f59e0b' : '#22c55e',
                  fillColor: anomaly.severity === 'high' ? '#dc2626' : anomaly.severity === 'medium' ? '#f59e0b' : '#22c55e',
                  fillOpacity: 0.1,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>Anomaly {anomaly.id}</strong><br/>
                    Severity: {anomaly.severity}<br/>
                    Location: {anomaly.lat.toFixed(4)}, {anomaly.lng.toFixed(4)}
                  </div>
                </Popup>
              </Circle>
            ))}

            {/* Bin Markers */}
            {toggles.bins && bins.map((bin) => (
              <Marker
                key={bin.id}
                position={[bin.lat, bin.lng]}
                icon={binIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>Bin {bin.id}</strong><br/>
                    Status: {bin.status}<br/>
                    Location: {bin.lat.toFixed(4)}, {bin.lng.toFixed(4)}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Truck Markers */}
            {toggles.trucks && trucks.map((truck) => (
              <Marker
                key={truck.id}
                position={[truck.lat, truck.lng]}
                icon={truckIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>Truck {truck.id}</strong><br/>
                    Status: {truck.status}<br/>
                    Location: {truck.lat.toFixed(4)}, {truck.lng.toFixed(4)}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Operator Markers */}
            {toggles.operators && operators.map((operator) => (
              <Marker
                key={operator.id}
                position={[operator.lat, operator.lng]}
                icon={operatorIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{operator.name}</strong><br/>
                    ID: {operator.id}<br/>
                    Location: {operator.lat.toFixed(4)}, {operator.lng.toFixed(4)}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Overlays Panel */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur border border-gray-200 p-4 rounded-xl shadow-md z-[1000] w-56 flex flex-col gap-3">
             <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 border-b border-gray-100 pb-2">Active Layers</div>
             {[
               { id: 'bins', label: 'Bin Locations' },
               { id: 'trucks', label: 'Truck Routes' },
               { id: 'anomalies', label: 'Anomaly Zones' },
               { id: 'operators', label: 'Operator Positions' }
             ].map((t) => (
                <div key={t.id} className="flex justify-between items-center cursor-pointer" onClick={() => setToggles({...toggles, [t.id]: !toggles[t.id as keyof typeof toggles]})}>
                  <span className="text-xs font-bold text-gray-700">{t.label}</span>
                  <div className={`w-8 h-4 rounded-full flex items-center px-0.5 transition-colors ${toggles[t.id as keyof typeof toggles] ? 'bg-[#0288D1]' : 'bg-gray-300'}`}>
                     <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${toggles[t.id as keyof typeof toggles] ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                </div>
             ))}
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center justify-between w-full md:w-auto gap-8 px-4">
              <div className="flex flex-col"><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Bins</span><span className="text-lg font-black text-gray-900">{bins.length}</span></div>
              <div className="flex flex-col"><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active Trucks</span><span className="text-lg font-black text-[#2E7D32]">{trucks.filter(t => t.status === 'active').length}</span></div>
              <div className="flex flex-col"><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Anomaly Zones</span><span className="text-lg font-black text-[#D32F2F]">{anomalies.length}</span></div>
              <div className="flex flex-col"><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Coverage</span><span className="text-lg font-black text-[#0288D1]">94%</span></div>
           </div>
           <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
             <button className="flex-1 md:flex-none px-6 py-2.5 bg-[#0288D1] hover:bg-[#0277BD] text-white font-bold rounded-lg shadow-sm transition-all text-xs uppercase tracking-widest">Open Full Map Interface</button>
             <button className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-lg shadow-sm transition-all text-xs uppercase tracking-widest">Export Map Report</button>
           </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isVisible, setIsVisible] = useState(false);
  const [liveComplaints, setLiveComplaints] = useState<any[]>([]);

  useEffect(() => {
    setIsVisible(true);
  }, [activeTab]); // Retrigger animation on tab change

  useEffect(() => {
    const unsubscribe = onReportsUpdate((reports) => {
      const normalized = [...reports].sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });
      setLiveComplaints(normalized);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-gray-900 font-sans flex flex-col selection:bg-[#0288D1]/20 selection:text-[#0288D1]">
      
      {/* TOP NAVBAR */}
      <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 sm:px-6 lg:px-8 z-20 shrink-0 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0288D1] rounded-[8px] flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-lg">C</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-extrabold text-gray-900 tracking-tight leading-tight">Smart Civic Cleanup System</h1>
            <p className="text-[9px] font-black text-[#0288D1] uppercase tracking-[0.2em]">Admin Central Protocol</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6">
           <button className="text-[14px] font-extrabold text-[#0288D1] border-b-2 border-[#0288D1] focus:outline-none transition-all py-1">
             Dashboard
           </button>
           <button onClick={() => onNavigate("commandcenter")} className="text-[14px] font-bold text-gray-500 hover:text-[#0288D1] transition-colors py-1">
             Command Center
           </button>
           <button className="text-xs font-bold text-gray-500 hover:text-gray-900 border border-gray-200 rounded px-2.5 py-1.5 transition-colors bg-gray-50 uppercase hidden md:block">
             हिंदी
           </button>
           <button onClick={() => onNavigate("login")} className="text-[14px] font-bold text-[#D32F2F] hover:text-red-800 hover:bg-[#FFEBEE] px-3 py-1.5 rounded-lg transition-colors border border-transparent">
             Logout
           </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden z-10 w-full max-w-[1920px] mx-auto relative">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] shrink-0 z-10">
          <nav className="flex-1 w-full py-8 space-y-1 overflow-y-auto">
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "map", label: "Tactical Map", icon: MapIcon },
              { id: "complaints", label: "Anomalies", icon: AlertTriangle },
              { id: "staff", label: "Operators", icon: Users },
              { id: "trucks", label: "Fleet Radar", icon: Truck },
              { id: "analytics", label: "Data Core", icon: Database }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setIsVisible(false); setTimeout(() => setActiveTab(item.id as TabType), 50); }}
                  className={`w-full flex items-center gap-4 px-6 py-3.5 text-[15px] font-bold transition-all border-l-[4px] outline-none ${
                    isActive 
                      ? "bg-[#E1F5FE]/50 text-[#0288D1] border-[#0288D1]" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-transparent"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="mt-auto p-4 w-full border-t border-gray-100 bg-gray-50">
             <div className="flex items-center gap-3 mb-4 p-2">
               <div className="w-10 h-10 rounded-full bg-[#E1F5FE] flex items-center justify-center text-[#0288D1] font-black border border-[#B3E5FC] shadow-sm text-lg flex-shrink-0">A</div>
               <div className="overflow-hidden">
                 <div className="text-[14px] font-extrabold text-gray-900 truncate">Admin User</div>
                 <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-0.5">System Overseer</div>
               </div>
             </div>
             <button 
               onClick={() => onNavigate("login")} 
               className="w-full flex items-center justify-center gap-2 text-gray-500 hover:bg-[#FFEBEE] hover:text-[#D32F2F] border border-gray-200 hover:border-[#FFCDD2] py-2.5 rounded-xl transition-all font-bold text-xs uppercase tracking-widest shadow-sm active:scale-95"
             >
               → Terminate Session
             </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto w-full custom-scrollbar bg-[#F4F6F9]">
          <div className={`p-6 md:p-10 transition-all duration-500 ease-out fill-mode-forwards ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            
            {activeTab === "overview" && (
              <div className="space-y-8 max-w-7xl">
                
                {/* 4 Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "NET TONNAGE", val: "145.2T", icon: BarChart2, color: "text-[#0288D1]" },
                    { label: "COMPLAINTS", val: `${liveComplaints.length || 0}`, icon: AlertTriangle, color: "text-[#D32F2F]" },
                    { label: "ACTIVE STAFF", val: "42", icon: Users, color: "text-[#2E7D32]" },
                    { label: "FLEET DEPLOYED", val: "12", icon: Truck, color: "text-[#F59E0B]" }
                  ].map((s, i) => (
                    <div key={i} className={`bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex flex-col relative transition-all duration-500 hover:-translate-y-1 hover:shadow-md`} style={{ transitionDelay: `${i * 100}ms` }}>
                       <div className="absolute top-6 right-6 text-gray-300">
                          <s.icon className={`w-6 h-6 ${s.color}`} />
                       </div>
                       <div className={`text-4xl font-black ${s.color} tracking-tight mb-2 pr-8`}>{s.val}</div>
                       <div className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Bottom Row (2 panels) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Chart */}
                  <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 flex flex-col transition-all duration-700 delay-300 relative overflow-hidden">
                    <h3 className="text-[15px] font-extrabold text-gray-900 mb-6 uppercase tracking-widest">Waste Collection Trajectory</h3>
                    <div className="flex-1 min-h-[300px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockAnalytics} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorWasteLight" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0288D1" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#0288D1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} dy={10} />
                          <YAxis stroke="#9CA3AF" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(v) => v === 0 ? "0" : v.toString()} ticks={[0, 1000, 2000, 3000, 4000]} dx={-10} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', color: '#111827', fontWeight: 'bold' }} 
                            itemStyle={{ color: '#0288D1', fontWeight: 'bold' }}
                            formatter={(value) => [`${value}`, 'waste']}
                          />
                          <Area type="monotone" dataKey="waste" stroke="#0288D1" strokeWidth={3} fill="url(#colorWasteLight)" activeDot={{ r: 6, strokeWidth: 0, fill: '#0288D1' }} animationDuration={1500} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* System Activity Feed */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 flex flex-col transition-all duration-700 delay-500">
                    <h3 className="text-[15px] font-extrabold text-gray-900 mb-8 uppercase tracking-widest">System Activity Feed</h3>
                    <div className="space-y-0 relative flex-1">
                      <div className="absolute top-2 bottom-2 left-[5px] w-[2px] bg-gray-100"></div>
                      {mockOverview.feed.map((f: any, i) => (
                        <div key={f.id} className="relative pl-8 pb-8 last:pb-0 group">
                            <div className={`absolute top-1 left-0 w-3 h-3 ${f.dot} rounded-full border-2 border-white shadow-sm ring-4 ring-white z-10 transition-transform group-hover:scale-125`}></div>
                            <div className="text-[11px] font-bold text-gray-400 mb-1 flex items-center gap-1.5 uppercase tracking-widest">
                              <span className="text-gray-500">{f.time}</span> <span className="font-black text-gray-300">&middot;</span> <span className="text-[#0288D1]">{f.user}</span>
                            </div>
                            <div className="text-[14px] font-bold text-gray-900 tracking-tight leading-snug">{f.action}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-8 max-w-7xl animate-in fade-in duration-500">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-8 tracking-tight">Data Core Analytics</h2>
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 flex flex-col relative overflow-hidden w-full h-[500px]">
                  <h3 className="text-[15px] font-extrabold text-gray-900 mb-6 uppercase tracking-widest">Comprehensive Waste Trajectory</h3>
                  <div className="flex-1 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockAnalytics} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorWasteLight2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0288D1" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#0288D1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} dy={10} />
                        <YAxis stroke="#9CA3AF" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(v) => v === 0 ? "0" : v.toString()} ticks={[0, 1000, 2000, 3000, 4000]} dx={-10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', color: '#111827', fontWeight: 'bold' }} 
                          itemStyle={{ color: '#0288D1', fontWeight: 'bold' }}
                          formatter={(value) => [`${value}`, 'waste']}
                        />
                        <Area type="monotone" dataKey="waste" stroke="#0288D1" strokeWidth={4} fill="url(#colorWasteLight2)" activeDot={{ r: 8, strokeWidth: 0, fill: '#0288D1' }} animationDuration={1500} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "complaints" && (
              <div className="space-y-6 max-w-5xl">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-8 tracking-tight">Active Anomalies</h2>
                <div className="flex flex-col gap-4">
                  {(liveComplaints.length ? liveComplaints : mockComplaints).map((c: any, i: number) => {
                    const isHigh = c.severity === 'high';
                    const isMedium = c.severity === 'medium';
                    const borderColor = isHigh ? 'border-l-[#D32F2F]' : isMedium ? 'border-l-[#F59E0B]' : 'border-l-[#2E7D32]';
                    const iconColor = isHigh ? 'text-[#D32F2F]' : isMedium ? 'text-[#F59E0B]' : 'text-[#2E7D32]';
                    const badgeClass = isHigh ? 'bg-[#FFEBEE] text-[#D32F2F] border-[#FFCDD2]' : isMedium ? 'bg-[#FFF8E1] text-[#F59E0B] border-[#FFECB3]' : 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]';
                    const complaintId = c.reportId || c.id;
                    const complaintArea = c.address || c.area || "Complaint Report";
                    const complaintPriority = (c.severity || c.priority || "low").toUpperCase();
                    const complaintTime = c.time || (c.createdAt ? new Date(c.createdAt).toLocaleString() : "Now");
                    const complaintDescription = c.description || c.desc || "No description provided";
                    
                    return (
                    <div key={i} className={`bg-white border border-gray-200 border-l-[4px] rounded-xl shadow-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between transition-all duration-300 hover:shadow-md ${borderColor}`} style={{ transitionDelay: `${i * 100}ms` }}>
                      <div className="flex items-center gap-5 mb-4 md:mb-0">
                        <div className={`p-3 rounded-xl bg-gray-50 border border-gray-100`}>
                          <AlertTriangle className={`w-7 h-7 ${iconColor}`} />
                        </div>
                        <div>
                          <div className="font-extrabold text-gray-900 text-lg mb-1.5 tracking-tight">{complaintArea}</div>
                          <div className="text-[13px] font-bold text-gray-600 mb-2">{complaintDescription}</div>
                          <div className="flex items-center gap-2">
                             <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">ID: {complaintId}</span>
                             <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest bg-white border border-gray-200 px-2 py-0.5 rounded shadow-sm"><Clock className="w-3 h-3 text-[#0288D1]"/> {complaintTime}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full md:w-auto">
                         <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${badgeClass}`}>
                           {complaintPriority} PRIORITY
                         </span>
                         <button className={`text-[12px] font-bold px-6 py-2.5 rounded-xl transition-all uppercase tracking-widest border ${
                            isHigh || isMedium 
                              ? "bg-[#0288D1] text-white border-transparent hover:bg-[#0277BD] shadow-sm active:scale-95" 
                              : "bg-gray-50 text-gray-500 border-gray-200 cursor-default"
                         }`}>
                           Dispatch Ops
                         </button>
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            )}

            {activeTab === "staff" && (
              <div className="space-y-6 max-w-7xl">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-8 tracking-tight">Operators</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {mockStaff.map((staffMember: any, idx) => (
                     <div key={staffMember.id} className="bg-white border border-gray-200 p-6 sm:p-8 rounded-xl shadow-sm flex flex-col hover:-translate-y-1 transition-all duration-300 hover:shadow-md" style={{ transitionDelay: `${idx * 150}ms` }}>
                        <div className="flex items-center gap-4 mb-6">
                           <div className="w-14 h-14 bg-[#E1F5FE] rounded-full flex items-center justify-center text-[#0288D1] font-black text-2xl border border-[#B3E5FC] shadow-sm shrink-0">
                             {staffMember.initial}
                           </div>
                           <div className="min-w-0">
                             <div className="text-[17px] font-extrabold text-gray-900 mb-1 truncate">{staffMember.name}</div>
                             <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">ID: {staffMember.id}</div>
                           </div>
                        </div>

                        <div className="space-y-4 mb-8">
                          <div>
                            <div className="flex justify-between text-[11px] mb-2 font-bold uppercase tracking-widest">
                              <span className="text-gray-400">Net Tonnage</span>
                              <span className="text-gray-900 font-black">{staffMember.waste} KG</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                              <div className="h-full bg-[#2E7D32] rounded-full transition-all duration-1000" style={{ width: isVisible ? `${(staffMember.waste / 600) * 100}%` : '0%' }} />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-auto border-t border-gray-100 pt-5">
                           {(staffMember.badges || []).map((b: string, _idx: number) => (
                             <span key={_idx} className="text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-1.5 shadow-sm">
                               <Shield className="w-3.5 h-3.5 text-[#0288D1]"/> {b}
                             </span>
                           ))}
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {/* Tactical Map */}
            {activeTab === "map" && (
              <div className="max-w-7xl animate-in fade-in duration-500">
                <TacticalMapPlaceholder />
              </div>
            )}

            {/* Other Placeholder Tabs */}
            {activeTab === "trucks" && (
               <div className="max-w-7xl animate-in fade-in duration-500">
                 <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 flex flex-col items-center justify-center min-h-[500px] w-full max-w-4xl mx-auto">
                   <div className="w-24 h-24 bg-[#E1F5FE] text-[#0288D1] rounded-full flex items-center justify-center mb-6 border border-[#B3E5FC] shadow-sm"><Truck size={40} /></div>
                   <h3 className="text-2xl font-extrabold text-gray-900 mb-4 tracking-tight">Fleet Radar Disabled</h3>
                   <p className="text-gray-500 text-center max-w-md mb-8 font-medium leading-relaxed">Fleet API tracking mapping is offline. Switch to Tactical Map for overview.</p>
                 </div>
               </div>
            )}

          </div>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#F4F6F9] text-gray-800 py-10 px-4 sm:px-6 lg:px-8 border-t border-gray-200 z-20 shrink-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-[15px] font-extrabold text-gray-900 mb-2 tracking-tight uppercase">Smart Civic Cleanup System</h3>
            <p className="text-[14px] text-gray-500 font-medium">Join hands in keeping our city clean and green.</p>
          </div>
          <div>
            <h4 className="font-extrabold mb-4 text-[10px] uppercase text-gray-400 tracking-widest">Quick Links</h4>
            <ul className="space-y-2 text-[14px] font-bold text-gray-600">
              <li><button onClick={() => onNavigate("dashboard")} className="hover:text-[#0288D1] transition-colors">Home</button></li>
              <li><button onClick={() => onNavigate("community")} className="hover:text-[#0288D1] transition-colors">Community</button></li>
              <li><button onClick={() => onNavigate("bins")} className="hover:text-[#0288D1] transition-colors">City Map</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-extrabold mb-4 text-[10px] uppercase text-gray-400 tracking-widest">Contact</h4>
            <ul className="space-y-2 text-[14px] font-bold text-gray-600">
              <li>support@smartcivic.com</li>
              <li>+1 800 123 4567</li>
              <li className="text-gray-500 mt-1">Civic Center, City Area</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
