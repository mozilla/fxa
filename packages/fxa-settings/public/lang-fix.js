/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* This module sets the language and direction on the HTML element ASAP,
 * before the main application bundle loads. This prevents a race condition
 * where the browser's translation service might offer to translate the page
 * based on the initial 'en' language attribute, before client-side rendering
 * can correct it. (FXA-12013) */

const supportedLanguages = window.SUPPORTED_LANGUAGES;
const rtlLocales = window.RTL_LOCALES;
const lang = findSupportedLanguage();
const dir = rtlLocales.includes(lang) ? 'rtl' : 'ltr';

function findSupportedLanguage() {
  for (const requestedLocale of window.navigator.languages || []) {
    if (supportedLanguages.includes(requestedLocale)) {
      return requestedLocale;
    }
    const language = requestedLocale.split('-')[0];
    if (supportedLanguages.includes(language)) {
      return language;
    }
  }
  return 'en';
}

document.documentElement.setAttribute('lang', lang);
document.documentElement.setAttribute('dir', dir);
