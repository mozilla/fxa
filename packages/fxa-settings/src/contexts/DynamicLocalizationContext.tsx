/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';
import {
  isRTLLocale,
  saveLocalePreference,
  clearLocalePreference,
  getCurrentLocale,
  getLocalePreference,
  validateLocale,
  detectBrowserDefaultLocale,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
} from '../lib/locales';

interface DynamicLocalizationContextType {
  currentLocale: string;
  switchLanguage: (locale: string) => Promise<void>;
  clearLanguagePreference: () => Promise<void>;
  isLoading: boolean;
}

const DynamicLocalizationContext =
  createContext<DynamicLocalizationContextType | null>(null);

export const DynamicLocalizationProvider: React.FC<{
  children: React.ReactNode;
  baseDir: string;
  bundles?: string[];
  reportBundleError?: (error: Error) => void;
}> = ({ children, baseDir, bundles = ['main'], reportBundleError }) => {
  const [currentLocale, setCurrentLocale] = useState(() => getCurrentLocale());
  const [userLocales, setUserLocales] = useState<readonly string[]>(() => [
    getCurrentLocale(),
    DEFAULT_LOCALE,
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [key, setKey] = useState(0); // Force re-render of AppLocalizationProvider
  // No saved locale: keep lang-fix.js's lang and dir until the locale changes
  const savedLocale = getLocalePreference();
  const langFixLocale = useRef<string | null>(
    savedLocale && validateLocale(savedLocale) ? null : currentLocale
  );

  useEffect(() => {
    if (currentLocale === langFixLocale.current) {
      return;
    }
    langFixLocale.current = null;
    document.documentElement.lang = currentLocale;
    document.documentElement.dir = isRTLLocale(currentLocale) ? 'rtl' : 'ltr';
  }, [currentLocale]);

  // Listen for storage changes (in case user changes locale in another tab)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // A null key means localStorage.clear(), which also removes the preference
      if (event.key !== null && event.key !== LOCALE_STORAGE_KEY) {
        return;
      }
      // Not getCurrentLocale(): its html.lang fallback holds the old locale
      const saved = getLocalePreference();
      const newLocale =
        saved && validateLocale(saved) ? saved : detectBrowserDefaultLocale();
      if (newLocale !== currentLocale) {
        setCurrentLocale(newLocale);
        setUserLocales([newLocale, DEFAULT_LOCALE]);
        setKey((prev) => prev + 1);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentLocale]);

  const switchLanguage = useCallback(
    async (locale: string) => {
      // Validate against supported languages
      if (!validateLocale(locale)) {
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

        // 2. Update state
        setCurrentLocale(locale);
        setUserLocales([locale, DEFAULT_LOCALE]);

        // 3. Force AppLocalizationProvider to re-mount and reload bundles
        setKey((prev) => prev + 1);
      } catch (error) {
        // Language switch failed, we can't really do anything about it so ignore it
      } finally {
        setIsLoading(false);
      }
    },
    [currentLocale]
  );

  const clearLanguagePreference = useCallback(async () => {
    setIsLoading(true);

    try {
      // 1. Clear preference from localStorage
      clearLocalePreference();

      // 2. Get browser's default locale
      const browserDefaultLocale = detectBrowserDefaultLocale();

      // 3. Update state
      setCurrentLocale(browserDefaultLocale);
      setUserLocales([browserDefaultLocale, DEFAULT_LOCALE]);

      // 4. Force AppLocalizationProvider to re-mount and reload bundles
      setKey((prev) => prev + 1);
    } catch (error) {
      // Clear failed, ignore it
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <DynamicLocalizationContext.Provider
      value={{
        currentLocale,
        switchLanguage,
        clearLanguagePreference,
        isLoading,
      }}
    >
      <AppLocalizationProvider
        key={key} // This forces re-mount when language changes
        baseDir={baseDir}
        userLocales={userLocales}
        bundles={bundles}
        reportBundleError={reportBundleError}
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
      isLoading: false,
    };
  }
  return context;
};
