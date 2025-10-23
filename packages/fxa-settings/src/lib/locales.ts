/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { rtlLocales, supportedLanguages } from '@fxa/shared/l10n';

// Default locale constant
export const DEFAULT_LOCALE = 'en';

export interface LocaleOption {
  code: string; // 'en', 'es', 'fr'
  name: string; // 'English', 'Español', 'Français'
  nativeName: string; // Native language name
  rtl: boolean; // Right-to-left flag
}

// Locale mappings with accurate supported languages
export const LOCALE_MAPPINGS: Record<string, LocaleOption> = {
  be: { code: 'be', name: 'Belarusian', nativeName: 'Беларуская', rtl: false },
  cs: { code: 'cs', name: 'Czech', nativeName: 'Čeština', rtl: false },
  cy: { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg', rtl: false },
  da: { code: 'da', name: 'Danish', nativeName: 'Dansk', rtl: false },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false },
  dsb: {
    code: 'dsb',
    name: 'Lower Sorbian',
    nativeName: 'Dolnoserbšćina',
    rtl: false,
  },
  el: { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', rtl: false },
  en: { code: 'en', name: 'English', nativeName: 'English', rtl: false },
  'en-GB': {
    code: 'en-GB',
    name: 'English (GB)',
    nativeName: 'English (GB)',
    rtl: false,
  },
  'en-CA': {
    code: 'en-CA',
    name: 'English (CA)',
    nativeName: 'English (CA)',
    rtl: false,
  },
  'en-US': {
    code: 'en-US',
    name: 'English (US)',
    nativeName: 'English (US)',
    rtl: false,
  },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false },
  'es-AR': {
    code: 'es-AR',
    name: 'Spanish (AR)',
    nativeName: 'Español (AR)',
    rtl: false,
  },
  'es-CL': {
    code: 'es-CL',
    name: 'Spanish (CL)',
    nativeName: 'Español (CL)',
    rtl: false,
  },
  'es-ES': {
    code: 'es-ES',
    name: 'Spanish (ES)',
    nativeName: 'Español (ES)',
    rtl: false,
  },
  'es-MX': {
    code: 'es-MX',
    name: 'Spanish (MX)',
    nativeName: 'Español (MX)',
    rtl: false,
  },
  eu: { code: 'eu', name: 'Basque', nativeName: 'Euskara', rtl: false },
  fi: { code: 'fi', name: 'Finnish', nativeName: 'Suomi', rtl: false },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', rtl: false },
  fur: { code: 'fur', name: 'Friulian', nativeName: 'Furlan', rtl: false },
  fy: { code: 'fy', name: 'Frisian', nativeName: 'Frysk', rtl: false },
  'fy-NL': {
    code: 'fy-NL',
    name: 'Frisian (Netherlands)',
    nativeName: 'Frysk (NL)',
    rtl: false,
  },
  gn: { code: 'gn', name: 'Guarani', nativeName: 'Guarani', rtl: false },
  he: { code: 'he', name: 'Hebrew', nativeName: 'עברית', rtl: true },
  hr: { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', rtl: false },
  hsb: {
    code: 'hsb',
    name: 'Upper Sorbian',
    nativeName: 'Hornjoserbšćina',
    rtl: false,
  },
  hu: { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', rtl: false },
  ia: {
    code: 'ia',
    name: 'Interlingua',
    nativeName: 'Interlingua',
    rtl: false,
  },
  is: { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', rtl: false },
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano', rtl: false },
  ja: { code: 'ja', name: 'Japanese', nativeName: '日本語', rtl: false },
  ka: { code: 'ka', name: 'Georgian', nativeName: 'ქართული', rtl: false },
  kab: { code: 'kab', name: 'Kabyle', nativeName: 'Taqbaylit', rtl: false },
  kk: { code: 'kk', name: 'Kazakh', nativeName: 'Қазақ тілі', rtl: false },
  ko: { code: 'ko', name: 'Korean', nativeName: '한국어', rtl: false },
  nl: { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', rtl: false },
  'nb-NO': {
    code: 'nb-NO',
    name: 'Norwegian Bokmål',
    nativeName: 'Norsk bokmål',
    rtl: false,
  },
  'nn-NO': {
    code: 'nn-NO',
    name: 'Norwegian Nynorsk',
    nativeName: 'Nynorsk',
    rtl: false,
  },
  'pa-IN': {
    code: 'pa-IN',
    name: 'Punjabi (India)',
    nativeName: 'ਪੰਜਾਬੀ',
    rtl: false,
  },
  pl: { code: 'pl', name: 'Polish', nativeName: 'Polski', rtl: false },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', rtl: false },
  'pt-BR': {
    code: 'pt-BR',
    name: 'Portuguese (Brazil)',
    nativeName: 'Português (BR)',
    rtl: false,
  },
  'pt-PT': {
    code: 'pt-PT',
    name: 'Portuguese (Portugal)',
    nativeName: 'Português (PT)',
    rtl: false,
  },
  rm: { code: 'rm', name: 'Romansh', nativeName: 'Rumantsch', rtl: false },
  ru: { code: 'ru', name: 'Russian', nativeName: 'Русский', rtl: false },
  sk: { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', rtl: false },
  sl: { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', rtl: false },
  sq: { code: 'sq', name: 'Albanian', nativeName: 'Shqip', rtl: false },
  sr: { code: 'sr', name: 'Serbian', nativeName: 'Српски', rtl: false },
  sv: { code: 'sv', name: 'Swedish', nativeName: 'Svenska', rtl: false },
  'sv-SE': {
    code: 'sv-SE',
    name: 'Swedish (Sweden)',
    nativeName: 'Svenska (SE)',
    rtl: false,
  },
  th: { code: 'th', name: 'Thai', nativeName: 'ไทย', rtl: false },
  tr: { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', rtl: false },
  uk: { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', rtl: false },
  vi: { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', rtl: false },
  'zh-CN': {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    rtl: false,
  },
  'zh-TW': {
    code: 'zh-TW',
    name: 'Chinese (Traditional)',
    nativeName: '正體中文',
    rtl: false,
  },
};

// Storage key for user locale preference
const LOCALE_STORAGE_KEY = 'fxa-settings-locale';

// Helper function to get available locales
export const getAvailableLocales = (): LocaleOption[] => {
  return supportedLanguages
    .filter((code: string) => LOCALE_MAPPINGS[code])
    .map((code: string) => LOCALE_MAPPINGS[code])
    .sort((a: LocaleOption, b: LocaleOption) => a.name.localeCompare(b.name));
};

// Helper function to check if locale is RTL
export const isRTLLocale = (locale: string): boolean => {
  return rtlLocales.includes(locale);
};

// Helper function to get current locale from various sources
export const getCurrentLocale = (): string => {
  // 1. Check localStorage for user preference
  const savedLocale = getLocalePreference();
  if (savedLocale && validateLocale(savedLocale)) {
    return savedLocale;
  }

  // 2. Check document.documentElement.lang
  const documentLang = document.documentElement.lang;
  if (documentLang && validateLocale(documentLang)) {
    return documentLang;
  }

  // 3. Use browser default detection
  return detectBrowserDefaultLocale();
};

// Save locale preference to localStorage
export const saveLocalePreference = (locale: string): void => {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch (error) {
    console.warn('Failed to save locale preference:', error);
  }
};

// Get locale preference from localStorage
export const getLocalePreference = (): string | null => {
  try {
    return localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to get locale preference:', error);
    return null;
  }
};

// Clear locale preference from localStorage (enables browser default)
export const clearLocalePreference = (): void => {
  try {
    localStorage.removeItem(LOCALE_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear locale preference:', error);
  }
};

// Check if user is using browser default (no saved preference)
export const isUsingBrowserDefault = (): boolean => {
  return getLocalePreference() === null;
};

// Validate that a locale is supported
export const validateLocale = (locale: string): boolean => {
  return supportedLanguages.includes(locale);
};

// Detect browser's default locale with fallback chain
export const detectBrowserDefaultLocale = (): string => {
  // Check navigator.language first
  const browserLang = navigator.language;
  if (browserLang && validateLocale(browserLang)) {
    return browserLang;
  }

  // Check base language (e.g., 'en' from 'en-US')
  const baseLang = browserLang?.split('-')[0];
  if (baseLang && validateLocale(baseLang)) {
    return baseLang;
  }

  // Default to English
  return DEFAULT_LOCALE;
};

// Get browser's default locale information
export const getBrowserDefaultLocaleInfo = (): LocaleOption | null => {
  const detectedLocale = detectBrowserDefaultLocale();

  if (LOCALE_MAPPINGS[detectedLocale]) {
    return LOCALE_MAPPINGS[detectedLocale];
  }

  // Fallback to English if locale mapping not found
  return LOCALE_MAPPINGS[DEFAULT_LOCALE] || null;
};
