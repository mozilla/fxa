/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { negotiateLanguages } from '@fluent/langneg';
import availableLocales from './supported-languages.json';
import moment from 'moment';
import { LocalizeOptions } from './l10n.types';
import { DEFAULT_LOCALE, EN_GB_LOCALES } from './l10n.constants';

/**
 * Takes an acceptLanguage value (assumed to come from an http header) and returns
 * a set of valid locales in order of precedence.
 * @param acceptLanguage - Http header accept-language value
 * @param supportedLanguages - List of supported language codes
 * @param overrideLocale - Single locale that should override acceptLanguage
 * @returns A list of associated supported locales. If there are no matches for the given
 *          accept language, then the default locle, en, will be returned.
 *
 */
export function parseAcceptLanguage(
  acceptLanguage?: string | null,
  supportedLanguages?: string[],
  overrideLocale?: string
) {
  if (!supportedLanguages) {
    supportedLanguages = availableLocales;
  }
  if (!acceptLanguage) {
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

  if (overrideLocale) {
    parsedLocalesByQValue.unshift(overrideLocale.toLocaleLowerCase());
  }

  const currentLocales = negotiateLanguages(
    parsedLocalesByQValue,
    [...supportedLanguages],
    {
      defaultLocale: 'en',
    }
  );

  return currentLocales;
}

/**
 * This module contains localization utils for the server
 */
export function localizeTimestamp({
  defaultLanguage,
  supportedLanguages = [],
}: LocalizeOptions) {
  if (!supportedLanguages || supportedLanguages.length === 0) {
    // must support at least one language.
    supportedLanguages = [defaultLanguage];
  } else {
    // default language must come first
    supportedLanguages.unshift(defaultLanguage);
  }

  return {
    /**
     * Convert a given `timestamp` to a moment 'time from now' format
     * based on a given `acceptLanguage`.
     * Docs: http://momentjs.com/docs/#/displaying/fromnow/
     *
     * @param {Number} timestamp
     * @param {String} acceptLanguageHeader
     * @returns {String} Returns a localized string based on a given timestamp.
     * Returns an empty string if no timestamp provided.
     */
    format: function format(timestamp?: number, acceptLanguageHeader?: string) {
      if (!timestamp) {
        return '';
      }

      // set the moment locale to determined `language`.
      const locale = determineLocale(
        acceptLanguageHeader || '',
        supportedLanguages
      );
      return moment(timestamp)
        .locale(locale || defaultLanguage)
        .fromNow();
    },
  };
}

/**
 * Get the best fitting locale, prioritizing request search params, followed by request header AcceptLanguage and DEFAULT_LOCALE as default
 * @param params - Parameters of the request
 * @param acceptLanguage - Accept language from request header
 * @param supportedLanguages - Supported languages to be matched with acceptLanguage
 * @returns The best fitting locale
 */
export function getLocaleFromRequest(
  params: { locale?: string },
  acceptLanguage: string | null,
  supportedLanguages?: string[]
) {
  if (params.locale) {
    return determineLocale(params?.locale, supportedLanguages);
  }

  if (acceptLanguage) {
    return determineLocale(acceptLanguage, supportedLanguages);
  }

  return DEFAULT_LOCALE;
}

/**
 * Given a set of supported languages and an accept-language http header value, this resolves language that fits best.
 * @param acceptLanguage - The accept-language http header value
 * @param supportedLanguages - optional set of supported languages. Defaults to main list held in ./supportedLanguages.json
 * @returns The best fitting locale
 */
export function determineLocale(
  acceptLanguage?: string,
  supportedLanguages?: string[],
  selectedLanguage?: string
) {
  // Returns languages in order of precedence, so we can just grab the first one.
  return parseAcceptLanguage(
    acceptLanguage,
    supportedLanguages,
    selectedLanguage
  )[0];
}

import rtlLocales from './rtl-locales.json';

/**
 * Given a set of supported languages and an accept-language http header value, this resolves the direction of the language that fits best.
 * @param acceptLanguage - The accept-language http header value
 * @param supportedLanguages - optional set of supported languages. Defaults to main list held in ./supportedLanguages.json
 * @returns The best fitting locale
 */
export function determineDirection(
  acceptLanguage: string,
  supportedLanguages?: string[]
) {
  const locale = determineLocale(acceptLanguage, supportedLanguages);
  if (rtlLocales.includes(locale)) {
    return 'rtl';
  }
  return 'ltr';
}
