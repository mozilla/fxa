/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { negotiateLanguages } from '@fluent/langneg';
import availableLocales from './supported-languages.json';
import { EN_GB_LOCALES } from './other-languages';

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
  for (const locale of parsedLocales) {
    const localeSplit = locale.trim().split(';');
    let lang = localeSplit[0];
    const q = localeSplit[1];

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

  // Order of locales represents priority and should correspond to q-values.
  const sortedQValues = Object.entries(qValues).sort((a, b) => b[1] - a[1]);
  const parsedLocalesByQValue = sortedQValues.map((qValue) => qValue[0]);

  const currentLocales = negotiateLanguages(
    parsedLocalesByQValue,
    [...supportedLanguages],
    {
      defaultLocale: 'en',
    }
  );

  return currentLocales;
}
