import React, { createContext, useContext, useState, ReactNode } from "react";
import enTranslations from "./src/locales/en.json";
import hiTranslations from "./src/locales/hi.json";

type Language = "en" | "hi";

type Translations = {
  [key in Language]: any;
};

const translations: Translations = {
  en: enTranslations,
  hi: hiTranslations
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string, defaultText?: string) => {
    const keys = key.split('.');
    let result: any = translations[language];
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return defaultText || key;
      }
    }
    
    return typeof result === 'string' ? result : (defaultText || key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
