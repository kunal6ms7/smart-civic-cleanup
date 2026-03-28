import { useState, useEffect } from "react";
import CitizenUploadModal from "./CitizenUploadModal";
import { useLanguage } from "./LanguageContext";
import { Info, Camera, BarChart2, Map, Users, ChevronRight } from "lucide-react";
import { getUserProfile, onReportsUpdate, onUsersUpdate } from "./src/services/databaseService";

const leaderboard = [{ rank: 1, pts: 2800 }, { rank: 2, pts: 1700 }, { rank: 3, pts: 1340 }];

export default function CitizenDashboard({
  onNavigate,
  citizenId,
}: {
  onNavigate: (p: string) => void;
  citizenId?: string;
}) {
  const { t } = useLanguage();
  const activeCitizenId = citizenId || localStorage.getItem("userId") || "anonymous";
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [points, setPoints] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [myReports, setMyReports] = useState<any[]>([]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    let mounted = true;

    getUserProfile(activeCitizenId)
      .then((profile) => {
        if (!mounted || !profile) return;
        setPoints(Number(profile.points || 0));
        setReportCount(Number(profile.reportsCount || 0));
      })
      .catch((error) => console.error("Failed to load citizen profile:", error));

    const unsubscribeUsers = onUsersUpdate((users) => {
      const currentUser = users.find((user) => user.userId === activeCitizenId || user.id === activeCitizenId);
      if (!currentUser) return;
      setPoints(Number(currentUser.points || 0));
      setReportCount(Number(currentUser.reportsCount || 0));
    });

    const unsubscribeReports = onReportsUpdate((reports) => {
      const mine = reports.filter((report) => report.userId === activeCitizenId);
      setReportCount(mine.length);
      setMyReports(
        [...mine].sort((a, b) => {
          const aTime = new Date(a.createdAt || 0).getTime();
          const bTime = new Date(b.createdAt || 0).getTime();
          return bTime - aTime;
        }).slice(0, 3)
      );
    });

    return () => {
      mounted = false;
      unsubscribeUsers();
      unsubscribeReports();
    };
  }, [activeCitizenId]);

  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] font-sans text-gray-900 pb-12 selection:bg-[#0288D1]/20 selection:text-[#0288D1]">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        
        {/* Notice Banner */}
        <div className="bg-[#E3F2FD] border border-blue-100 rounded-xl p-4 mb-8 flex items-start sm:items-center gap-4 shadow-sm">
          <div className="flex-shrink-0 text-[#0288D1]">
            <Info size={24} />
          </div>
          <p className="text-sm text-gray-800 font-medium">
            <span className="font-bold text-[#0288D1] uppercase tracking-widest text-[11px] mr-2">Notice:</span> 
            Transport inbound to Central Zone in 12 min. Recycling efficiency is up by 17% this week!
          </p>
        </div>

        {/* Hero Section */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 sm:p-12 mb-10 flex flex-col md:flex-row items-center justify-between gap-10 hover:shadow-md transition-shadow">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Smart Civic Cleanup System
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-xl font-medium">
              Join hands in keeping our city clean and green.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="px-8 py-3.5 bg-[#0288D1] hover:bg-[#0277BD] text-white font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2.5 active:scale-95 border border-transparent"
              >
                <Camera size={20} />
                Submit Report
              </button>
              <button 
                onClick={() => onNavigate("track")}
                className="px-8 py-3.5 bg-white border-2 border-gray-200 hover:border-[#0288D1] hover:bg-blue-50 text-gray-700 hover:text-[#0288D1] font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2.5 active:scale-95"
              >
                <BarChart2 size={20} />
                Track Waste
              </button>
            </div>
          </div>

          <div className="flex-shrink-0 w-48 h-48 rounded-full border-[6px] border-[#2E7D32] bg-white shadow-lg flex flex-col items-center justify-center relative overlow-hidden">
            <div className="absolute inset-0 rounded-full border-4 border-[#2E7D32]/20 scale-[1.05]"></div>
            <span className="text-5xl font-black text-gray-900">{points}</span>
            <span className="text-sm font-bold text-[#2E7D32] mt-1 tracking-widest">POINTS</span>
            <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">{reportCount} Reports</span>
          </div>
        </div>

        {/* Response Feed */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Complaint Responses</h2>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0288D1]">{reportCount} Total</span>
          </div>
          <div className="space-y-3">
            {myReports.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm font-medium text-gray-500">
                Your submitted complaints and staff responses will appear here.
              </div>
            )}
            {myReports.map((report) => (
              <div key={report.reportId || report.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="font-extrabold text-gray-900">{report.address || "Nashik Complaint"}</div>
                    <div className="mt-1 text-sm font-medium text-gray-600">{report.description}</div>
                    {report.assignedTruckName && (
                      <div className="mt-2 text-[11px] font-black uppercase tracking-widest text-[#0288D1]">
                        Truck Assigned: {report.assignedTruckName}
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] font-black uppercase tracking-widest text-[#2E7D32]">
                    {report.status || "pending"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Three Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Bin Status */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">Bin Status</h3>
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Live Telemetry</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#E3F2FD] text-[#0288D1] flex items-center justify-center border border-blue-100">
                  <Map size={24} />
                </div>
              </div>
              
              <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">Zone Alpha Capacity</span>
                  <span className="text-sm font-black text-gray-900">72%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0288D1] w-[72%] rounded-full transition-all duration-1000 ease-out"></div>
                </div>
              </div>
              
              <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
                Analyze surrounding bins and view real-time capacities via interactive map interface.
              </p>
            </div>
            <button onClick={() => onNavigate("bins")} className="mt-8 py-3 w-full rounded-xl bg-[#E3F2FD] hover:bg-[#B3E5FC] text-[#0288D1] text-sm font-extrabold flex items-center justify-center gap-2 uppercase tracking-wide transition-colors">
              Initialize Map <ChevronRight size={18} className="stroke-[3]" />
            </button>
          </div>

          {/* Card 2: Community */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">Community</h3>
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Civic Network</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#E3F2FD] text-[#0288D1] flex items-center justify-center border border-blue-100">
                  <Users size={24} />
                </div>
              </div>

              <div className="flex items-center mb-6">
                <div className="flex -space-x-3">
                  <div className="w-9 h-9 rounded-full border-[3px] border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 shadow-sm z-30">A</div>
                  <div className="w-9 h-9 rounded-full border-[3px] border-white bg-[#0288D1] flex items-center justify-center text-xs font-bold text-white shadow-sm z-20">B</div>
                  <div className="w-9 h-9 rounded-full border-[3px] border-white bg-[#2E7D32] flex items-center justify-center text-xs font-bold text-white shadow-sm z-10">C</div>
                  <div className="w-9 h-9 rounded-full border-[3px] border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm z-0 relative pr-0.5">+2k</div>
                </div>
                <span className="text-[13px] text-gray-600 font-bold ml-4">Active Guardians</span>
              </div>
              
              <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
                Redeem rewards, check black market stats, and sync with citizens.
              </p>
            </div>
            <button onClick={() => onNavigate("rewards")} className="mt-8 py-3 w-full rounded-xl bg-[#E3F2FD] hover:bg-[#B3E5FC] text-[#0288D1] text-sm font-extrabold flex items-center justify-center gap-2 uppercase tracking-wide transition-colors">
              Explore Rewards <ChevronRight size={18} className="stroke-[3]" />
            </button>
          </div>

          {/* Card 3: Leaderboard */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-xl font-extrabold text-gray-900">Leaderboard</h3>
                <span className="text-[10px] font-black text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-widest">
                  #1 Rank
                </span>
              </div>
              
              <div className="space-y-3 flex-1">
                {leaderboard.map((e, index) => {
                  const getRankDetails = () => {
                    if (index === 0) return "bg-amber-100 text-amber-700 border border-amber-200 shadow-sm transform scale-[1.02]";
                    if (index === 1) return "bg-slate-100 text-slate-700 border border-slate-200";
                    if (index === 2) return "bg-orange-50 text-orange-700 border border-orange-200";
                    return "bg-gray-50 text-gray-500";
                  };
                  return (
                    <div key={e.rank} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${getRankDetails()}`}>
                          {e.rank}
                        </span>
                        <span className="text-[15px] font-bold text-gray-900">User_{e.rank}0{e.rank}X</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[15px] font-black text-[#2E7D32]">{e.pts} <span className="text-[9px] text-gray-500 uppercase tracking-widest border border-transparent">POINTS</span></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100 text-center bg-gray-50 rounded-xl p-4 border shadow-sm">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5 font-bold">Designation</p>
                <p className="text-[15px] font-black text-gray-900">Rank #1 Guardian</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      <CitizenUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        citizenId={activeCitizenId}
        onNavigate={onNavigate}
      />
    </div>
  );
}
