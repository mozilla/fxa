/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Country->phone number info.
 */
define((require, exports, module) => {
  'use strict';

  /**
   * Each country entry should have the fields listed below.
   */
  /**
   * Format `serverPhoneNumber` for display.
   *
   * @method format
   * @param {String} serverPhoneNumber phone number returned by the server
   * @return {String} phone number formatted for country
   */

  /**
   * Normalize a string accepted by `pattern` to the full phone number,
   * including country code prefix.
   *
   * @method normalize
   * @param {String} num phone number to convert
   * @return {String} full phone number with country code prefix
   */

  /**
   * Pattern used for input validation
   *
   * @property pattern
   * @type {RegExp}
   */

  /**
   * Country code prefix
   * @property prefix
   * @type {String}
   */

  /**
   * Rollout rate. Should be in the range of [0, 1]. Used
   * for gradual rollouts to a country. If rolloutRate is
   * not defined, 1 is assumed.
   *
   * @property rolloutRate
   * @type {Number}
   */

  /**
   * Create a `format` function. `${serverPhoneNumber}` in `format`
   * will be replaced with `serverPhoneNumber`
   *
   * @param {String} format
   * @returns {Function}
   */
  function formatter (format) {
    return (serverPhoneNumber) => format.replace(/\$\{serverPhoneNumber\}/, serverPhoneNumber);
  }

  function hasPrefix (num, prefix) {
    return num.indexOf(prefix) === 0;
  }

  function ensurePrefix (prefix) {
    return function (num) {
      if (hasPrefix(num, prefix)) {
        return num;
      }
      return `${prefix}${num}`;
    };
  }

  module.exports = {
    // Austria
    // https://en.wikipedia.org/wiki/Telephone_numbers_in_Austria
    AT: {
      format: formatter('+43 ${serverPhoneNumber}'),
      normalize: ensurePrefix('+43'),
      pattern: /^(?:\+43)?\d{6,}$/,
      prefix: '+43',
      rolloutRate: 0 // being soft launched. Testers will need to open `/sms?service=sync&country=AT`
    },
    // Germany
    // https://en.wikipedia.org/wiki/Telephone_numbers_in_Germany
    DE: {
      format: formatter('+49 ${serverPhoneNumber}'),
      normalize: ensurePrefix('+49'),
      pattern: /^(?:\+49)?\d{6,13}$/,
      prefix: '+49',
      rolloutRate: 0 // being soft launched. Testers will need to open `/sms?service=sync&country=DE`
    },
    GB: {
      format: formatter('+44 ${serverPhoneNumber}'),
      normalize: ensurePrefix('+44'),
      pattern: /^(?:\+44)?\d{10,10}$/,
      prefix: '+44'
    },
    RO: {
      format: formatter('+40 ${serverPhoneNumber}'),
      normalize(num) {
        // allow +40 country code prefix
        // as well as an extra 0 before the 7 prefix.
        const prefix = /^(\+40)?0?/;
        if (prefix.test(num)) {
          num = num.replace(prefix, '');
        }
        return `+40${num}`;
      },
      // +407xxxxxxxx, allow leading 0 for sloppiness.
      pattern: /^(?:\+40)?0?7\d{8,8}$/,
      prefix: '+40',
      rolloutRate: 0.5
    },
    US: {
      // Americans don't use country codes, just return the number
      // as formatted by the backend.
      format: (formattedNumber) => formattedNumber,
      normalize (num) {
        if (/^\+1/.test(num)) {
          return num;
        } else if (/^1/.test(num) && num.length === 11) {
          return `+${num}`;
        }
        return `+1${num}`;
      },
      pattern: /^(\+?1)?[2-9]\d{9,9}$/, // allow for a +1 or 1 prefix before the area code, area codes are all 2-9
      prefix: '+1'
    }
  };

  // alias CA (Canada) to use the same info as the US.
  module.exports.CA = module.exports.US;
});
