/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
define(['./request', 'sjcl', './hkdf', './pbkdf2'], function(
  Request,
  sjcl,
  hkdf,
  pbkdf2
) {
  'use strict';

  // Key wrapping and stretching configuration.
  var NAMESPACE = 'identity.mozilla.com/picl/v1/';
  var PBKDF2_ROUNDS = 1000;
  var STRETCHED_PASS_LENGTH_BYTES = 32 * 8;

  var HKDF_SALT = sjcl.codec.hex.toBits('00');
  var HKDF_LENGTH = 32;

  /**
   * Key Wrapping with a name
   *
   * @method kw
   * @static
   * @param {String} name The name of the salt
   * @return {bitArray} the salt combination with the namespace
   */
  function kw(name) {
    return sjcl.codec.utf8String.toBits(NAMESPACE + name);
  }

  /**
   * Key Wrapping with a name and an email
   *
   * @method kwe
   * @static
   * @param {String} name The name of the salt
   * @param {String} email The email of the user.
   * @return {bitArray} the salt combination with the namespace
   */
  function kwe(name, email) {
    return sjcl.codec.utf8String.toBits(NAMESPACE + name + ':' + email);
  }

  /**
   * @class credentials
   * @constructor
   */
  return {
    /**
     * Setup credentials
     *
     * @method setup
     * @param {String} emailInput
     * @param {String} passwordInput
     * @return {Promise} A promise that will be fulfilled with `result` of generated credentials
     */
    setup: function(emailInput, passwordInput) {
      var result = {};
      var email = kwe('quickStretch', emailInput);
      var password = sjcl.codec.utf8String.toBits(passwordInput);

      result.emailUTF8 = emailInput;
      result.passwordUTF8 = passwordInput;

      return pbkdf2
        .derive(password, email, PBKDF2_ROUNDS, STRETCHED_PASS_LENGTH_BYTES)
        .then(function(quickStretchedPW) {
          result.quickStretchedPW = quickStretchedPW;

          return hkdf(
            quickStretchedPW,
            kw('authPW'),
            HKDF_SALT,
            HKDF_LENGTH
          ).then(function(authPW) {
            result.authPW = authPW;

            return hkdf(
              quickStretchedPW,
              kw('unwrapBkey'),
              HKDF_SALT,
              HKDF_LENGTH
            );
          });
        })
        .then(function(unwrapBKey) {
          result.unwrapBKey = unwrapBKey;
          return result;
        });
    },
    /**
     * Wrap
     *
     * @method wrap
     * @param {bitArray} bitArray1
     * @param {bitArray} bitArray2
     * @return {bitArray} wrap result of the two bitArrays
     */
    xor: function(bitArray1, bitArray2) {
      var result = [];

      for (var i = 0; i < bitArray1.length; i++) {
        result[i] = bitArray1[i] ^ bitArray2[i];
      }

      return result;
    },
    /**
     * Unbundle the WrapKB
     * @param {String} key Bundle Key in hex
     * @param {String} bundle Key bundle in hex
     * @returns {*}
     */
    unbundleKeyFetchResponse: function(key, bundle) {
      var self = this;
      var bitBundle = sjcl.codec.hex.toBits(bundle);

      return this.deriveBundleKeys(key, 'account/keys').then(function(keys) {
        var ciphertext = sjcl.bitArray.bitSlice(bitBundle, 0, 8 * 64);
        var expectedHmac = sjcl.bitArray.bitSlice(bitBundle, 8 * -32);
        var hmac = new sjcl.misc.hmac(keys.hmacKey, sjcl.hash.sha256);
        hmac.update(ciphertext);

        if (!sjcl.bitArray.equal(hmac.digest(), expectedHmac)) {
          throw new Error('Bad HMac');
        }

        var keyAWrapB = self.xor(
          sjcl.bitArray.bitSlice(bitBundle, 0, 8 * 64),
          keys.xorKey
        );

        return {
          kA: sjcl.codec.hex.fromBits(
            sjcl.bitArray.bitSlice(keyAWrapB, 0, 8 * 32)
          ),
          wrapKB: sjcl.codec.hex.fromBits(
            sjcl.bitArray.bitSlice(keyAWrapB, 8 * 32)
          ),
        };
      });
    },
    /**
     * Derive the HMAC and XOR keys required to encrypt a given size of payload.
     * @param {String} key Hex Bundle Key
     * @param {String} keyInfo Bundle Key Info
     * @returns {Object} hmacKey, xorKey
     */
    deriveBundleKeys: function(key, keyInfo) {
      var bitKeyInfo = kw(keyInfo);
      var salt = sjcl.codec.hex.toBits('');
      key = sjcl.codec.hex.toBits(key);

      return hkdf(key, bitKeyInfo, salt, 3 * 32).then(function(keyMaterial) {
        return {
          hmacKey: sjcl.bitArray.bitSlice(keyMaterial, 0, 8 * 32),
          xorKey: sjcl.bitArray.bitSlice(keyMaterial, 8 * 32),
        };
      });
    },
  };
});
