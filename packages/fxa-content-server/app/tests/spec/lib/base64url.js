/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var base64url = require('lib/base64url');
  var chai = require('chai');
  var sjcl = require('sjcl');

  var assert = chai.assert;

  describe('lib/base64url', function () {
    it('encodes and decodes properly', function () {
      // Test string chosen to encode to a value with "-" and "_" in it.
      // Raw bytes are '\xFA\xAB?!'.
      var raw = sjcl.codec.hex.toBits('faab3f21');
      var encoded = '-qs_IQ==';
      assert.equal(base64url.encode(raw), encoded);
      assert.deepEqual(base64url.decode(encoded), raw);
    });
  });
});

