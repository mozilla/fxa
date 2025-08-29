/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';
import { isRTLLocale, saveLocalePreference, clearLocalePreference, getCurrentLocale } from '../lib/locales';
import { supportedLanguages } from '@fxa/shared/l10n';

const DEFAULT_LOCALE = 'en';

interface DynamicLocalizationContextType {
  currentLocale: string;
  switchLanguage: (locale: string) => Promise<void>;
  clearLanguagePreference: () => Promise<void>;
  isLoading: boolean;
}

const DynamicLocalizationContext = createContext<DynamicLocalizationContextType | null>(null);

export const DynamicLocalizationProvider: React.FC<{
  children: React.ReactNode;
  baseDir: string;
  bundles?: string[];
}> = ({ children, baseDir, bundles = ['main'] }) => {
  const [currentLocale, setCurrentLocale] = useState(() => getCurrentLocale());
  const [userLocales, setUserLocales] = useState<readonly string[]>(() => [getCurrentLocale(), DEFAULT_LOCALE]);
  const [isLoading, setIsLoading] = useState(false);
  const [key, setKey] = useState(0); // Force re-render of AppLocalizationProvider

  // Listen for storage changes (in case user changes locale in another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const newLocale = getCurrentLocale();
      if (newLocale !== currentLocale) {
        setCurrentLocale(newLocale);
        setUserLocales([newLocale, DEFAULT_LOCALE]);
        setKey(prev => prev + 1);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentLocale]);

  const switchLanguage = useCallback(async (locale: string) => {
    // Validate against supported languages
    if (!supportedLanguages.includes(locale)) {
      console.warn(`Locale ${locale} is not supported`);
      return;
    }

    if (locale === currentLocale) {
      return; // No change needed
    }

    setIsLoading(true);

    try {
      // 1. Save preference to localStorage
      saveLocalePreference(locale);

      // 2. Update document attributes
      document.documentElement.lang = locale;
      document.documentElement.dir = isRTLLocale(locale) ? 'rtl' : 'ltr';

      // 3. Update state
      setCurrentLocale(locale);
      setUserLocales([locale, DEFAULT_LOCALE]);

      // 4. Force AppLocalizationProvider to re-mount and reload bundles
      setKey(prev => prev + 1);

    } catch (error) {
      // Language switch failed, we can't really do anything about it so ignore it
    } finally {
      setIsLoading(false);
    }
  }, [currentLocale]);

  const clearLanguagePreference = useCallback(async () => {
    setIsLoading(true);

    try {
      // 1. Clear preference from localStorage
      clearLocalePreference();

      // 2. Get browser's default locale directly (ignore document.lang)
      let browserDefaultLocale = 'en'; // fallback
      
      // Check navigator.language first
      const browserLang = navigator.language;
      if (browserLang && supportedLanguages.includes(browserLang)) {
        browserDefaultLocale = browserLang;
      } else {
        // Check base language (e.g., 'en' from 'en-US')
        const baseLang = browserLang?.split('-')[0];
        if (baseLang && supportedLanguages.includes(baseLang)) {
          browserDefaultLocale = baseLang;
        }
      }

      // 3. Update document attributes
      document.documentElement.lang = browserDefaultLocale;
      document.documentElement.dir = isRTLLocale(browserDefaultLocale) ? 'rtl' : 'ltr';

      // 4. Update state
      setCurrentLocale(browserDefaultLocale);
      setUserLocales([browserDefaultLocale, DEFAULT_LOCALE]);

      // 5. Force AppLocalizationProvider to re-mount and reload bundles
      setKey(prev => prev + 1);

    } catch (error) {
      // Clear failed, ignore it
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <DynamicLocalizationContext.Provider value={{
      currentLocale,
      switchLanguage,
      clearLanguagePreference,
      isLoading
    }}>
      <AppLocalizationProvider
        key={key} // This forces re-mount when language changes
        baseDir={baseDir}
        userLocales={userLocales}
        bundles={bundles}
      >
        {children}
      </AppLocalizationProvider>
    </DynamicLocalizationContext.Provider>
  );
};

export const useDynamicLocalization = () => {
  const context = useContext(DynamicLocalizationContext);
  if (!context) {
    // Provide a fallback for test environments
    return {
      currentLocale: DEFAULT_LOCALE,
      switchLanguage: async () => {},
      clearLanguagePreference: async () => {},
      isLoading: false
    };
  }
  return context;
};
