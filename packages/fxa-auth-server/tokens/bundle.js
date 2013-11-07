/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


/*  Utility functions for working with encrypted data bundles.
 * 
 *  This module provides 'bundle' and 'unbundle' functions that perform the
 *  simple encryption operations required by the picl-idp API.  The encryption
 *  works as follows:
 * 
 *    * Input is some master key material, a string identifying the context
 *      of the data, and a payload to be encrypted.
 *
 *    * HKDF is used to derive a 32-byte HMAC key and an encryption key of
 *      length equal to the payload.  The context string is used to ensure
 *      that these keys are unique to this encryption context.
 *
 *    * The payload is XORed with the encryption key, then HMACed using the
 *      HMAC key.
 *
 *    * Output is the hex-encoded concatenation of the ciphertext and HMAC.
 *      
 */


module.exports = function (crypto, P, hkdf, error) {


  var HASH_ALGORITHM = 'sha256'


  function Bundle() {}


  // Encrypt the given buffer into a hex ciphertext string.
  //
  Bundle.bundle = function (key, keyInfo, payload) {
    return deriveBundleKeys(key, keyInfo, payload.length)
      .then(
        function (keys) {
          var ciphertext = xorBuffers(payload, keys[1])
          var hmac = crypto.createHmac(HASH_ALGORITHM, keys[0])
          hmac.update(ciphertext)
          return Buffer.concat([ciphertext, hmac.digest()]).toString('hex')
        }
      )
  }


  // Decrypt the given hex string into a buffer of plaintext data.
  //
  Bundle.unbundle = function (key, keyInfo, payload) {
    payload = Buffer(payload, 'hex')
    var ciphertext = payload.slice(0, -32)
    var expectedHmac = payload.slice(-32)
    return deriveBundleKeys(key, keyInfo, ciphertext.length)
      .then(
        function (keys) {
          var hmac = crypto.createHmac(HASH_ALGORITHM, keys[0])
          hmac.update(ciphertext)
          if (!buffersAreEqual(hmac.digest(), expectedHmac)) {
            throw error.invalidSignature()
          }
          return xorBuffers(ciphertext, keys[1])
        }
      )
  }


  // Derive the HMAC and XOR keys required to encrypt a given size of payload.
  //
  function deriveBundleKeys(key, keyInfo, payloadSize) {
    return hkdf(key, keyInfo, null, 32 + payloadSize)
      .then(
        function (keyMaterial) {
          var hmacKey = keyMaterial.slice(0, 32)
          var xorKey = keyMaterial.slice(32)
          return [hmacKey, xorKey]
        }
      )
  }


  // Xor the contents of two equal-sized buffers.
  //
  function xorBuffers(buffer1, buffer2) {
    if (buffer1.length !== buffer2.length) {
      throw new Error(
        'XOR buffers must be same length (%d != %d)',
        buffer1.length,
        buffer2.length
      )
    }
    var result = Buffer(buffer1.length)
    for (var i = 0; i < buffer1.length; i++) {
      result[i] = buffer1[i] ^ buffer2[i]
    }
    return result
  }


  //  Time-invariant buffer comparison.
  //  For checking hmacs without timing attacks.
  //
  function buffersAreEqual(buffer1, buffer2) {
    var mismatch = buffer1.length - buffer2.length
    if (mismatch) {
      return false
    }
    for (var i = 0; i < buffer1.length; i++) {
      mismatch |= buffer1[i] ^ buffer2[i]
    }
    return mismatch === 0
  }


  return Bundle
}
