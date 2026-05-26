import React, { createContext, useContext, useState } from 'react';
import translations from '../i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('vi');

  const t = (key, vars) => {
    const val = translations[language]?.[key] ?? translations['vi']?.[key] ?? key;
    if (!vars || typeof val !== 'string') return val;
    return Object.entries(vars).reduce(
      (s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, 'g'), v),
      val
    );
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
