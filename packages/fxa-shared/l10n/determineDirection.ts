/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
// TODO - FXA-8413 - Delete file. Replaced by @fxa/shared/l10n

import { determineLocale } from './determineLocale';
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
