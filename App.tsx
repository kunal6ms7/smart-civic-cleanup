import { useState } from "react";
import Login from "./Login";
import CitizenDashboard from "./CitizenDashboard";
import CommandCenter from "./CommandCenter";
import Community from "./Community";
import LiveBinStatus from "./LiveBinStatus";
import TrackTruck from "./TrackTruck";
import AdminDashboard from "./AdminDashboard";
import CitizenMap from "./CitizenMap";
import StaffMap from "./StaffMap";
import { useLanguage } from "./LanguageContext";
import Landing from "./Landing";
import Navbar from "./Navbar";
import { logoutUser } from "./services/firebaseService";

type Page = "landing" | "login" | "citizen" | "citizen_map" | "command" | "staff_map" | "community" | "livebin" | "tracktruck" | "admin_dashboard" | "map";
type Role = "citizen" | "staff" | "admin";

// REDESIGNED: Layout integration and clean app framework
export default function App() {
  // Start on login directly for easier immediate testing; change to landing when ready.
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem("userId"));
  const { language } = useLanguage();

  const handleLogin = (role: Role) => {
    setUserRole(role);
    setUserId(localStorage.getItem("userId"));
    if (role === "citizen") {
      setCurrentPage("citizen");
    } else if (role === "admin") {
      setCurrentPage("admin_dashboard");
    } else {
      setCurrentPage("command"); // staff go to command center
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    setUserRole(null);
    setUserId(null);
    setCurrentPage("landing");
  };

  const handleNavigate = (page: string) => {
    if (page === "bins") setCurrentPage("livebin"); 
    else if (page === "track") setCurrentPage("tracktruck");
    else if (page === "community") setCurrentPage("community");
    else if (page === "admin") setCurrentPage("command");
    else if (page === "citizen") setCurrentPage("citizen");
    else if (page === "rewards") setCurrentPage("community");
    else setCurrentPage(page as Page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "landing": return <Landing onNavigate={handleNavigate} />;
      case "login": return <Login onLogin={handleLogin} />;
      case "citizen": return <CitizenDashboard onNavigate={handleNavigate} citizenId={userId || undefined} />;
      case "citizen_map": return <CitizenMap onNavigate={handleNavigate} />;
      case "admin_dashboard": return <AdminDashboard onNavigate={handleNavigate} />;
      case "command": return <CommandCenter onNavigate={handleNavigate} />;
      case "staff_map": return <StaffMap onNavigate={handleNavigate} />;
      case "community": return <Community onNavigate={handleNavigate} />;
      case "livebin": return <LiveBinStatus onNavigate={handleNavigate} />;
      case "tracktruck": return <TrackTruck onNavigate={handleNavigate} />;
      default: return <div className="p-8 text-center text-[#475569]">Page not found</div>;
    }
  };

  return (
    <div className={`flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans ${language === 'hi' ? 'font-hindi' : ''}`}>
      {/* If entirely logged out, the landing/login page will render; otherwise we show Navbar */}
      {currentPage !== "login" && currentPage !== "landing" && (
        <Navbar 
          onNavigate={handleNavigate} 
          currentPage={currentPage}
          userRole={userRole}
          onLogout={handleLogout}
        />
      )}
      
      <main className="flex-1 flex flex-col relative w-full">
        {renderPage()}
      </main>
    </div>
  );
}
