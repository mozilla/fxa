/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { parseAcceptLanguage } from './parse-accept-language';

/**
 * Given a set of supported languages and an accept-language http header value, this resolves language that fits best.
 * @param acceptLanguage - The accept-language http header value
 * @param supportedLanguages - optional set of supported languages. Defaults to main list held in ./supportedLanguages.json
 * @returns The best fitting locale
 */
export function determineLocale(
  acceptLanguage: string,
  supportedLanguages?: string[]
) {
  // Returns languages in order of precedence, so we can just grab the first one.
  return parseAcceptLanguage(acceptLanguage, supportedLanguages)[0];
}
