/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'sjcl',
  'lib/base64url'
], function (chai, sjcl, base64url) {
  'use strict';

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

