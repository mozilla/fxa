/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  ThemePreference,
  EffectiveTheme,
  getStoredTheme,
  setStoredTheme,
  getEffectiveTheme,
  getSystemTheme,
  isDarkBasedTheme,
} from '../../lib/theme-storage';

export interface ThemeContextValue {
  themePreference: ThemePreference;
  effectiveTheme: EffectiveTheme;
  setThemePreference: (theme: ThemePreference) => void;
  isDarkBased: boolean;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

// All theme classes that can be applied
const THEME_CLASSES = ['dark', 'theme-cyberpunk', 'theme-candyland'] as const;

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(
    () => getStoredTheme()
  );
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>(() =>
    getEffectiveTheme(getStoredTheme())
  );

  const setThemePreference = useCallback((theme: ThemePreference) => {
    setStoredTheme(theme);
    setThemePreferenceState(theme);
    setEffectiveTheme(getEffectiveTheme(theme));
  }, []);

  // Apply theme classes to document
  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes first
    THEME_CLASSES.forEach((cls) => root.classList.remove(cls));

    // Apply appropriate classes based on theme
    switch (effectiveTheme) {
      case 'dark':
        root.classList.add('dark');
        break;
      case 'cyberpunk':
        root.classList.add('dark', 'theme-cyberpunk');
        break;
      case 'candyland':
        root.classList.add('theme-candyland');
        break;
      // 'light' - no classes needed (default)
    }
  }, [effectiveTheme]);

  // Listen for system theme changes when preference is 'system'
  useEffect(() => {
    if (themePreference !== 'system') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setEffectiveTheme(getSystemTheme());
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themePreference]);

  const isDarkBased = isDarkBasedTheme(effectiveTheme);

  return (
    <ThemeContext.Provider
      value={{ themePreference, effectiveTheme, setThemePreference, isDarkBased }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
