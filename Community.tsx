import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useLanguage } from "./LanguageContext";

const EVENTS = [
  { name: "Upper Lake Cleanup", pts: 142, progress: 78, desc: "Starts in 4 Days" },
  { name: "Van Vihar Sector Run", pts: 89,  progress: 45, desc: "Starts in 9 Days" },
  { name: "Sector 44 Drive",    pts: 65,  progress: 30, desc: "Starts in 13 Days" },
];

export default function Community({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`min-h-screen w-full bg-[#F4F6F9] font-sans text-gray-900 pb-16 selection:bg-[#0288D1]/20 selection:text-[#0288D1] ${language === 'hi' ? 'font-hindi' : ''}`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        
        {/* Header / Intro */}
        <div className="mb-12 text-center md:text-left">
           <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
             Community
           </h1>
           <p className="text-lg text-gray-600 max-w-2xl font-medium leading-relaxed">
             Join local cleanup drives to earn credits, protect the environment, and climb the civic leaderboard.
           </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 content-start">
          {EVENTS.map(e => (
            <div key={e.name} className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              
              <div className="flex items-start justify-between mb-8">
                <div className="pr-4">
                  <h3 className="text-xl font-extrabold text-gray-900 mb-3 leading-tight">{e.name}</h3>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full uppercase tracking-widest border border-gray-200">
                    <Clock size={12} className="text-gray-500" />
                    {e.desc}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="inline-block bg-[#E8F5E9] border border-[#C8E6C9] px-3 py-2 rounded-xl text-center">
                    <div className="text-[#2E7D32] font-black text-2xl leading-none">
                      {e.pts}
                    </div>
                    <div className="text-[9px] text-[#2E7D32] uppercase tracking-widest font-bold mt-1">
                      Credits
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between text-[11px] mb-2 font-bold uppercase tracking-widest">
                   <span className="text-gray-500">Participation Target</span>
                   <span className="text-[#0288D1]">{e.progress}%</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0288D1] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${e.progress}%` }}
                  />
                </div>
              </div>
              
              <button 
                onClick={() => onNavigate("rewards")}
                className="w-full py-3.5 rounded-xl bg-[#0288D1] hover:bg-[#0277BD] text-white text-[15px] font-bold flex items-center justify-center gap-2 tracking-wide transition-all shadow-sm active:scale-95 border border-transparent"
              >
                Join Initiative
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
