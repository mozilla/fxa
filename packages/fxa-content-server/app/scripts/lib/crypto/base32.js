/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import base32Decode from 'base32-decode';
import importFxaCryptoDeriver from './deriver';

// Base32 encoding based on Douglas Crockford
// Ref: https://en.wikipedia.org/wiki/Base32#Crockford.27s_Base32
const ALPHABET_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export default {
  /**
   * Generate a random base 32 string.
   *
   * @param {Integer} length Length of string
   * @returns {Promise<string>}
   */
  generate: function (length = 32) {
    return importFxaCryptoDeriver().then(({ jose }) => {
      const bytes = jose.util.randomBytes(length);

      const code = [];
      for (let i = 0; i < length; i++) {
        code.push(ALPHABET_BASE32[bytes[i] & 0x1f]);
      }

      return code.join('');
    });
  },
  /**
   * Decode a base 32 string.
   *
   * @param {String} string String to decode
   * @returns {Promise<string>} A promise that will be fulfilled with decoded base 32 string raw bytes
   */
  decode: function (string) {
    return Promise.resolve(base32Decode(string, 'Crockford'));
  },
};
