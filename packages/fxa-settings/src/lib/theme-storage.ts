/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Storage from './storage';

const THEME_KEY = 'theme_preference';

// All available themes
export const THEMES = ['light', 'dark', 'cyberpunk', 'candyland', 'system'] as const;
export type ThemePreference = (typeof THEMES)[number];

// Effective themes (what's actually applied - system resolves to light/dark base)
export type EffectiveTheme = 'light' | 'dark' | 'cyberpunk' | 'candyland';

// Theme display names for the UI
export const THEME_LABELS: Record<ThemePreference, string> = {
  light: 'Light',
  dark: 'Dark',
  cyberpunk: 'Cyberpunk',
  candyland: 'Candy Land',
  system: 'System',
};

const storage = Storage.factory('localStorage');

export function getStoredTheme(): ThemePreference {
  const stored = storage.get(THEME_KEY);
  if (THEMES.includes(stored as ThemePreference)) {
    return stored as ThemePreference;
  }
  return 'system';
}

export function setStoredTheme(theme: ThemePreference): void {
  storage.set(THEME_KEY, theme);
}

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return 'light';
}

export function getEffectiveTheme(preference: ThemePreference): EffectiveTheme {
  if (preference === 'system') {
    return getSystemTheme();
  }
  return preference as EffectiveTheme;
}

// Check if theme uses dark base (for Tailwind dark: classes)
export function isDarkBasedTheme(theme: EffectiveTheme): boolean {
  return theme === 'dark' || theme === 'cyberpunk';
}
