/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Base64url encoding/decoding of SJCL bitArrays.
 *
 * SJCL natively supports standard base64 encoding but not the urlsafe
 * variant, which is needed for JWTs.
 */

define(function (require, exports, module) {
  'use strict';

  var sjcl = require('sjcl');

  module.exports = {

    encode: function (bits) {
      return sjcl.codec.base64.fromBits(bits)
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    },

    decode: function (chars) {
      return sjcl.codec.base64.toBits(
        chars.replace(/-/g, '+').replace(/_/g, '/')
      );
    }

  };
});
