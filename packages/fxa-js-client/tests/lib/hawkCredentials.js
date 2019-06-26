/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'node_modules/sjcl/sjcl',
  'client/lib/hawkCredentials',
], function(tdd, assert, sjcl, hawkCredentials) {
  with (tdd) {
    suite('hawkCredentials', function() {
      test('#client derive hawk credentials', function() {
        var context = 'sessionToken';
        var sessionToken =
          'a0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebf';

        return hawkCredentials(sessionToken, context, 3 * 32).then(function(
          result
        ) {
          var hmacKey = sjcl.codec.hex.fromBits(result.key);

          assert.equal(
            hmacKey,
            '9d8f22998ee7f5798b887042466b72d53e56ab0c094388bf65831f702d2febc0',
            '== hmacKey is equal'
          );
          assert.equal(
            result.id,
            'c0a29dcf46174973da1378696e4c82ae10f723cf4f4d9f75e39f4ae3851595ab',
            '== id is equal'
          );
        },
        assert.notOk);
      });
    });
  }
});
