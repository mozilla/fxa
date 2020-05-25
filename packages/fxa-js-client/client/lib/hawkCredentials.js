/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const sjcl = require('sjcl');
const hkdf = require('./hkdf');

var PREFIX_NAME = 'identity.mozilla.com/picl/v1/';
var bitSlice = sjcl.bitArray.bitSlice;
var salt = sjcl.codec.hex.toBits('');

/**
 * @class hawkCredentials
 * @method deriveHawkCredentials
 * @param {String} tokenHex
 * @param {String} context
 * @param {int} size
 * @returns {Promise}
 */
function deriveHawkCredentials(tokenHex, context, size) {
  var token = sjcl.codec.hex.toBits(tokenHex);
  var info = sjcl.codec.utf8String.toBits(PREFIX_NAME + context);

  return hkdf(token, info, salt, size || 3 * 32).then(function (out) {
    var authKey = bitSlice(out, 8 * 32, 8 * 64);
    var bundleKey = bitSlice(out, 8 * 64);

    return {
      algorithm: 'sha256',
      id: sjcl.codec.hex.fromBits(bitSlice(out, 0, 8 * 32)),
      key: authKey,
      bundleKey: bundleKey,
    };
  });
}

module.exports = deriveHawkCredentials;
