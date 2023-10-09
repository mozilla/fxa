/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import moment from 'moment';
import { determineLocale } from './determine-locale';

export type LocalizeOptions = {
  defaultLanguage: string;
  supportedLanguages?: string[];
};

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
