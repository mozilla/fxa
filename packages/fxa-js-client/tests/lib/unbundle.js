/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;
const sjcl = require('sjcl');
const credentials = require('../../client/lib/credentials');

describe('unbundle', function () {
  it('#vector 1', function () {
    // credentials.unbundleKeyFetchResponse(bundleKey, 'account/keys', payload.bundle);
    // Vectors generated from fxa-auth-server
    var bundleKey =
      'ba0a107dab60f3b065ff7a642d14fe824fbd71bc5c99087e9e172a1abd1634f1';
    var keyInfo = 'account/keys';
    var bundle =
      'e47eb17e487eb4495e79846d5e0c16ea51ef51ff5ef59cd8f626f95f572ec64dcc7b97fcbc0d0ece0cc93dbe6ac84974066830280ccacf5de13a8460524238cf543edfc5027aabeddc107e9fd429a25ce6f5d94917f2a6435380ee5f11353814';
    var bitBundle = sjcl.codec.hex.toBits(bundle);

    return credentials
      .deriveBundleKeys(bundleKey, keyInfo)
      .then(function (keys) {
        assert.equal(
          sjcl.codec.hex.fromBits(keys.hmacKey),
          '17ab463653a94c9a6419b48781930edefe500395e3b4e7879a2be15999757022',
          '== hmacKey equal'
        );
        assert.equal(
          sjcl.codec.hex.fromBits(keys.xorKey),
          '85de16c3218a126404668bf9b7acfb6ce2b7e03c8889047ba48b8b854c6d8beb3ae100e145ca6d69cb519a872a83af788771954455716143bc08225ea8644d85',
          '== xorKey equal'
        );

        var keyAWrapB = credentials.xor(
          sjcl.bitArray.bitSlice(bitBundle, 0, 8 * 64),
          keys.xorKey
        );
        assert.equal(
          sjcl.codec.hex.fromBits(keyAWrapB),
          '61a0a7bd69f4a62d5a1f0f94e9a0ed86b358b1c3d67c98a352ad72da1b434da6f69a971df9c763a7c798a739404be60c8119a56c59bbae1e5d32a63efa26754a',
          '== xorBuffers equal'
        );
        var keyObj = {
          kA: sjcl.codec.hex.fromBits(
            sjcl.bitArray.bitSlice(keyAWrapB, 0, 8 * 32)
          ),
          wrapKB: sjcl.codec.hex.fromBits(
            sjcl.bitArray.bitSlice(keyAWrapB, 8 * 32, 8 * 64)
          ),
        };

        return keyObj;
      })
      .then(function (result) {
        assert.equal(
          result.kA,
          '61a0a7bd69f4a62d5a1f0f94e9a0ed86b358b1c3d67c98a352ad72da1b434da6',
          '== kA equal'
        );
        assert.equal(
          result.wrapKB,
          'f69a971df9c763a7c798a739404be60c8119a56c59bbae1e5d32a63efa26754a',
          '== wrapKB equal'
        );
      });
  });

  it('#vector 2', function () {
    var bundleKey =
      'dedd009a8275a4f672bb4b41e14a117812c0b2f400c85fa058e0293f3f45726a';
    var bundle =
      'df4717238a738501bd2ad8f7114ef193ea69751a40108149bfb88a5643a8d683a1e75b705d4db135130f0896dbac0819ab7d54334e0cd4f9c945e0a7ada91899756cedf4384be404844050270310bc2b396f100eeda0c7b428cfe77c40a873ae';
    return credentials
      .unbundleKeyFetchResponse(bundleKey, bundle)
      .then(function (result) {
        assert.equal(
          result.kA,
          '939282904b808c6003ea31aeb14bc766d2ab70ba7dcaa54f820efcf4762b9619',
          '== kA equal'
        );
        assert.equal(
          result.wrapKB,
          '849ac9f71643ace46dcdd384633ec1bffe565852806ee2f859c3eba7fafeafec',
          '== wrapKB equal'
        );
      });
  });
});
