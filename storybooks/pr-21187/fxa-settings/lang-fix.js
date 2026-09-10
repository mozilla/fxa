/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* This module sets the language and direction on the HTML element ASAP,
 * before the main application bundle loads. This prevents a race condition
 * where the browser's translation service might offer to translate the page
 * based on the initial 'en' language attribute, before client-side rendering
 * can correct it. (FXA-12013) */
try {
  const configTag = document.querySelector('meta[name="fxa-config"]');
  const serverConfig = JSON.parse(decodeURIComponent(configTag.content));
  const { supportedLanguages, rtlLocales } = serverConfig.l10n;
  const supported = new Set(supportedLanguages);

  let lang = 'en';

  for (const requested of navigator.languages || []) {
    // check for exact match e.g. "en-US"
    if (supported.has(requested)) {
      lang = requested;
      break;
    }
    // check for base language match e.g. "en"
    const baseLang = requested.split('-')[0];
    if (supported.has(baseLang)) {
      lang = baseLang;
      break;
    }
  }

  const dir = rtlLocales.includes(lang) ? 'rtl' : 'ltr';

  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
} catch (e) {
  console.error('Error updating HTML lang attribute.', e);
  document.documentElement.lang = 'en';
  document.documentElement.dir = 'ltr';
}
