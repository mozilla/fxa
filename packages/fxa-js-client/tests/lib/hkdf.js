/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!tdd',
  'intern/chai!assert',
  'node_modules/sjcl/sjcl',
  'client/lib/hkdf',
], function(tdd, assert, sjcl, hkdf) {
  with (tdd) {
    // test vectors from RFC5869
    suite('hkdf', function() {
      test('#vector 1', function() {
        var ikm = sjcl.codec.hex.toBits(
          '0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b'
        );
        var salt = sjcl.codec.hex.toBits('000102030405060708090a0b0c');
        var info = sjcl.codec.hex.toBits('f0f1f2f3f4f5f6f7f8f9');

        return hkdf(ikm, info, salt, 42).then(function(result) {
          assert.equal(sjcl.codec.hex.fromBits(result).length, 84);
          assert.equal(
            sjcl.codec.hex.fromBits(result),
            '3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865'
          );
        }, assert.notOk);
      });

      test('#vector 2', function() {
        var ikm = sjcl.codec.hex.toBits(
          '0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b'
        );
        var salt = sjcl.codec.hex.toBits('');
        var info = sjcl.codec.hex.toBits('');

        return hkdf(ikm, info, salt, 42).then(function(result) {
          assert.equal(sjcl.codec.hex.fromBits(result).length, 84);
          assert.equal(
            sjcl.codec.hex.fromBits(result),
            '8da4e775a563c18f715f802a063c5a31b8a11f5c5ee1879ec3454e5f3c738d2d9d201395faa4b61a96c8'
          );
        }, assert.notOk);
      });

      test('#vector 3', function() {
        var ikm = sjcl.codec.hex.toBits(
          '4a9cbe5ae7190a7bb7cc54d5d84f5e4ba743904f8a764933b72f10260067375a'
        );
        var salt = sjcl.codec.hex.toBits('');
        var info = sjcl.codec.utf8String.toBits(
          'identity.mozilla.com/picl/v1/keyFetchToken'
        );

        return hkdf(ikm, info, salt, 3 * 32).then(function(result) {
          assert.equal(
            sjcl.codec.hex.fromBits(result),
            'f4df04ffb79db35e94e4881719a6f145f9206e8efea17fc9f02a5ce09cbfac1e829a935f34111d75e0d16b7aa178e2766759eedb6f623c0babd2abcfea82bc12af75f6aa543a8ba7e0a029f87c785c4af0ad03889f7437f735b5256a88fc73fd'
          );
        }, assert.notOk);
      });

      test('#vector 4', function() {
        var ikm = sjcl.codec.hex.toBits(
          'ba0a107dab60f3b065ff7a642d14fe824fbd71bc5c99087e9e172a1abd1634f1'
        );
        var salt = sjcl.codec.hex.toBits('');
        var info = sjcl.codec.utf8String.toBits(
          'identity.mozilla.com/picl/v1/account/keys'
        );

        return hkdf(ikm, info, salt, 3 * 32).then(function(result) {
          assert.equal(
            sjcl.codec.hex.fromBits(result),
            '17ab463653a94c9a6419b48781930edefe500395e3b4e7879a2be1599975702285de16c3218a126404668bf9b7acfb6ce2b7e03c8889047ba48b8b854c6d8beb3ae100e145ca6d69cb519a872a83af788771954455716143bc08225ea8644d85'
          );
        }, assert.notOk);
      });
    });
  }
});
