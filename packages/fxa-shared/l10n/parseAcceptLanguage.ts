/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { negotiateLanguages } from '@fluent/langneg';
import availableLocales from './supportedLanguages.json';
import { EN_GB_LOCALES } from './otherLanguages';

/**
 * Takes an acceptLanguage value (assumed to come from an http header) and returns
 * a set of valid locales in order of precedence.
 * @param acceptLanguage - Http header accept-language value
 * @param supportedLanguages - List of supported language codes
 * @returns A list of associated supported locales. If there are no matches for the given
 *          accept language, then the default locle, en, will be returned.
 *
 */
export function parseAcceptLanguage(
  acceptLanguage: string,
  supportedLanguages?: string[]
) {
  if (!supportedLanguages) {
    supportedLanguages = availableLocales;
  }
  if (acceptLanguage == null) {
    acceptLanguage = '';
  }

  /**
   * Based on criteria set forth here: https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.4
   * Process involves breaking string by comma, then extracting language code and numeric q value. Then
   * languages are sorted by q value. If no q-value is specified, then the q value defaults to
   * 1 as per the specificiation. Q-values are clamped between 0-1.
   */
  const parsedLocales = acceptLanguage.split(',');
  const qValues: Record<string, number> = {};
  for (let locale of parsedLocales) {
    let [lang, q] = locale.trim().split(';');
    const match = /(q=)([0-9\.-]*)/gm.exec(q) || [];
    const qvalue = parseFloat(match[2]) || 1.0;

    if (EN_GB_LOCALES.includes(lang)) {
      lang = 'en-GB';
    }

    // Make regions case insensitive. This might not be technically valid, but
    // trying keep things backwards compatible.
    lang = lang.toLocaleLowerCase();

    if (!qValues[lang]) {
      qValues[lang] = Math.max(Math.min(qvalue, 1.0), 0.0);
    }
  }

  /*
   * We use the 'matching' strategy because the default strategy, 'filtering', will load all
   * English locales with dialects included, e.g. `en-CA`, even when the user prefers 'en' or
   * 'en-US', which would then be shown instead of the English (US) fallback text.
   */
  const currentLocales = negotiateLanguages(
    [...Object.keys(qValues)],
    [...supportedLanguages],
    {
      defaultLocale: 'en',
      strategy: 'matching',
    }
  );

  // Order of locales represents priority and should correspond to q-values.
  currentLocales.sort(
    (a, b) => qValues[b.toLocaleLowerCase()] - qValues[a.toLocaleLowerCase()]
  );

  return currentLocales;
}
