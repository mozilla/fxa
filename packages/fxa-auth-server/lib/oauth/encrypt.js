/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const crypto = require('crypto');
const buf = require('buf').hex;

exports.hash = function hash(value) {
  var sha = crypto.createHash('sha256');
  sha.update(buf(value));
  return sha.digest();
};
