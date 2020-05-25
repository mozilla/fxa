/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';
const randomBytes = require('../promise').promisify(
  require('crypto').randomBytes
);

// The alphabet is lowercase for backwards compatibility with the previous keyspace
// and the content-server also normalizes the codes to lowercase on submit
const ALPHABET = '0123456789abcdefghjkmnpqrstvwxyz';

function base32(len) {
  return randomBytes(len).then((bytes) => {
    const out = [];

    for (let i = 0; i < len; i++) {
      out.push(ALPHABET[bytes[i] % 32]);
    }

    return out.join('');
  });
}

module.exports = base32;
