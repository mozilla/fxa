/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const crypto = require('crypto');

module.exports = {
  createHashHex() {
    const hash = crypto.createHash('sha256');
    const args = [...arguments];
    args.forEach((arg) => {
      hash.update(arg + '\0');
    });
    return hash.digest().toString('hex');
  },

  initialCapital(string) {
    return `${string[0].toUpperCase()}${string.substr(1)}`;
  },
};
