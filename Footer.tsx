import { useLanguage } from "./LanguageContext";

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const { t, language } = useLanguage();

  return (
    <footer className={`bg-[#F4F6F9] text-gray-800 py-12 px-4 sm:px-6 lg:px-8 mt-auto border-t border-gray-200 ${language === 'hi' ? 'font-hindi' : 'font-sans'}`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-extrabold text-gray-900 mb-4 tracking-tight">Smart Civic Cleanup System</h3>
          <p className="text-[15px] text-gray-500 max-w-xs leading-relaxed font-medium">
            Join hands in keeping our city clean and green.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold mb-4 text-[12px] uppercase text-gray-400 tracking-widest">Quick Links</h4>
          <ul className="space-y-3 text-[15px] font-semibold text-gray-600">
            <li><button onClick={() => onNavigate("login")} className="hover:text-[#0288D1] transition-colors">Home</button></li>
            <li><button onClick={() => onNavigate("community")} className="hover:text-[#0288D1] transition-colors">Community</button></li>
            <li><button onClick={() => onNavigate("bins")} className="hover:text-[#0288D1] transition-colors">City Map</button></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold mb-4 text-[12px] uppercase text-gray-400 tracking-widest">Contact</h4>
          <ul className="space-y-3 text-[15px] font-medium text-gray-600">
            <li className="flex items-center gap-2">
              <span className="w-5 text-gray-400 font-mono text-center">@</span>
              support@smartcivic.com
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 text-gray-400 font-mono text-center">P</span>
              +1 800 123 4567
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 text-gray-400 font-mono text-center">L</span>
              Civic Center, City Area
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-200 text-sm font-semibold text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>© 2026 All rights reserved. Smart Civic Cleanup System.</p>
        <div className="flex space-x-5">
          {/* Twitter Icon */}
          <a href="#" className="text-gray-400 hover:text-[#0288D1] transition-colors" aria-label="Twitter">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
          </a>
          {/* Spotify Icon */}
          <a href="#" className="text-gray-400 hover:text-[#1DB954] transition-colors" aria-label="Spotify">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.177 17.513c-.156.467-.626.657-1.042.428-2.613-1.439-5.903-1.765-9.782-.967-.406.084-.799-.176-.883-.582-.084-.406.176-.799.582-.883 4.253-.872 7.892-.494 10.79 1.102.395.216.541.713.335 1.05zm1.487-3.328c-.198.59-1.397.747-2.035.352-3.003-1.849-7.6-2.427-10.9-1.332-.572.191-1.189-.118-1.38-.69-.191-.572.118-1.189.69-1.38 3.864-1.284 9.032-.628 12.551 1.542.493.305.65.923.354 1.417zm.156-3.483c-3.606-2.138-9.528-2.336-12.969-1.29-.714.218-1.474-.185-1.692-.899-.218-.714.185-1.474.899-1.692 4.026-1.222 10.569-1.002 14.777 1.49.638.38 1.05.99.704 1.748-.266.584-1.05.808-1.719.431z"/></svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
