/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var moment = require('moment');
var acceptLanguage = require('accept-language');

/**
 * This module contains localization utils for the server
 **/
module.exports = function(options) {
  options = options || {};

  if (!options.defaultLanguage) {
    throw new Error('defaultLanguage is required');
  }

  var defaultLanguage = options.defaultLanguage;
  var supportedLanguages = options.supportedLanguages;
  if (!Array.isArray(supportedLanguages)) {
    supportedLanguages = [];
  }

  if (supportedLanguages.length === 0) {
    // must support at least one language.
    supportedLanguages = [defaultLanguage];
  } else {
    // default language must come first
    supportedLanguages.unshift(defaultLanguage);
  }

  // setup supported languages
  acceptLanguage.languages(supportedLanguages);

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
    format: function format(timestamp, acceptLanguageHeader) {
      if (!timestamp) {
        return '';
      }
      // create a new moment from a timestamp
      var lastAccessTime = moment(timestamp);
      var language = defaultLanguage;
      try {
        if (acceptLanguageHeader) {
          var parseHeader = acceptLanguage.parse(acceptLanguageHeader);
          // parse should return an Array of parsed languages in priority order based on the `acceptLanguageHeader`.
          if (
            parseHeader &&
            Array.isArray(parseHeader) &&
            parseHeader.length > 0 &&
            parseHeader[0].language
          ) {
            // the 'accept-language' will fallback to unsupported locale if it cannot find anything
            // we do not want that, only set language if it is a supported locale.
            if (supportedLanguages.indexOf(parseHeader[0].language) !== -1) {
              language = parseHeader[0].language;
            }
          }
        }
      } catch (e) {
        // failed to parse the header, fallback to defaultLanguage
      }

      // set the moment locale to determined `language`.
      lastAccessTime.locale(language);
      // return a formatted `timeago` type string
      return lastAccessTime.fromNow();
    },
  };
};
