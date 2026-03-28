import { useState } from "react";
import { useLanguage } from "./LanguageContext";

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  userRole: string | null;
  onLogout: () => void;
}

export default function Navbar({ onNavigate, currentPage, userRole, onLogout }: NavbarProps) {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeClass = "text-[#0288D1] font-bold border-b-2 border-[#0288D1]";
  const idleClass = "text-gray-500 hover:text-[#0288D1] font-semibold transition-colors border-b-2 border-transparent";

  const getNavLinks = () => {
    if (!userRole) return [];
    if (userRole === "citizen") {
      return [
        { id: "citizen", label: t("nav.dashboard", "Dashboard") },
        { id: "citizen_map", label: t("nav.map", "City Map") },
        { id: "community", label: t("nav.community", "Community") }
      ];
    }
    if (userRole === "admin") {
      return [
        { id: "admin_dashboard", label: t("nav.dashboard", "Dashboard") },
        { id: "command", label: t("nav.command_center", "Command Center") }
      ];
    }
    // Staff
    return [
      { id: "command", label: t("nav.dashboard", "Dashboard") },
      { id: "staff_map", label: t("nav.map", "City Map") },
      { id: "livebin", label: t("nav.bin_status", "Bin Status") },
      { id: "tracktruck", label: t("nav.truck_tracking", "Track Truck") }
    ];
  };

  return (
    <nav className={`bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm ${language === 'hi' ? 'font-hindi' : 'font-sans'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer" onClick={() => onNavigate(userRole === "citizen" ? "citizen" : userRole === "admin" ? "admin_dashboard" : "command")}>
            <div className="w-8 h-8 rounded bg-[#0288D1] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              C
            </div>
            <span className="font-extrabold text-[#111827] hidden sm:block tracking-tight text-lg">
              Smart Civic Cleanup System
            </span>
          </div>

          {/* Desktop Links */}
          {userRole && (
            <div className="hidden md:flex space-x-8 items-center h-full ml-auto mr-6">
              {getNavLinks().map(link => (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`h-full px-1 pt-1 text-[15px] ${currentPage === link.id ? activeClass : idleClass}`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button
               onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="text-xs font-bold text-gray-500 hover:text-gray-900 border border-gray-200 rounded px-2.5 py-1.5 transition-colors bg-gray-50 hover:bg-gray-100 uppercase tracking-wide"
            >
              {language === "en" ? "हिंदी" : "EN"}
            </button>
            
            {userRole && (
              <button 
                onClick={onLogout}
                className="hidden md:block text-[15px] font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent"
              >
                Logout
              </button>
            )}

            {/* Mobile menu button */}
            {userRole && (
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
              >
                <span className="sr-only">Open menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Slide-down */}
      {mobileMenuOpen && userRole && (
        <div className="md:hidden border-t border-gray-100 bg-white px-2 pt-2 pb-3 space-y-1 shadow-inner">
          {getNavLinks().map(link => (
            <button
              key={link.id}
              onClick={() => { onNavigate(link.id); setMobileMenuOpen(false); }}
              className={`block w-full text-left px-3 py-2 rounded-lg text-base font-bold ${
                currentPage === link.id 
                  ? "bg-[#E3F2FD] text-[#0288D1]" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#0288D1]"
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => { onLogout(); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 rounded-lg text-base font-bold text-red-600 hover:bg-red-50 mt-2 border-t border-gray-100 pt-3"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
