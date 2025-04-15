import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (obj: any) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: () => '',
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize language from localStorage or default to 'en'
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('preferred_language');
    return (savedLanguage === 'en' || savedLanguage === 'zh') ? savedLanguage : 'en';
  });

  // Persist language preference
  useEffect(() => {
    localStorage.setItem('preferred_language', language);
  }, [language]);

  const t = (obj: any): string => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'object' && obj[language]) {
      return obj[language];
    }
    // Fallback to English if translation is missing
    if (typeof obj === 'object' && obj.en) {
      return obj.en;
    }
    return '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};