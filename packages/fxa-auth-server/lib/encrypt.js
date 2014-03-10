/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const crypto = require('crypto');

const config = require('./config');

exports.hash = function hash(value) {
  var sha = crypto.createHash(config.get('encrypt.hashAlg'));
  sha.update(value);
  return sha.digest();
};
