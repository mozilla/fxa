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
  getStoredTheme,
  setStoredTheme,
  getEffectiveTheme,
  getSystemTheme,
} from '../../lib/theme-storage';

export interface ThemeContextValue {
  themePreference: ThemePreference;
  effectiveTheme: 'light' | 'dark';
  setThemePreference: (theme: ThemePreference) => void;
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

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(
    () => getStoredTheme()
  );
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() =>
    getEffectiveTheme(getStoredTheme())
  );

  const setThemePreference = useCallback((theme: ThemePreference) => {
    setStoredTheme(theme);
    setThemePreferenceState(theme);
    setEffectiveTheme(getEffectiveTheme(theme));
  }, []);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
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

  return (
    <ThemeContext.Provider
      value={{ themePreference, effectiveTheme, setThemePreference }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
