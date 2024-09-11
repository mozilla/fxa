/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

/*  Utility functions for working with encrypted data bundles.
 *
 *  This module provides 'bundle' and 'unbundle' functions that perform the
 *  simple encryption operations required by the fxa-auth-server API.  The
 *  encryption works as follows:
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

import butil from '../crypto/butil';

import crypto from 'crypto';
import error from '../error';
import hkdf from '../crypto/hkdf';

const HASH_ALGORITHM = 'sha256';

export default {
  // Encrypt the given buffer into a hex ciphertext string.
  //
  async bundle(key, keyInfo, payload) {
    key = Buffer.from(key, 'hex');
    payload = Buffer.from(payload, 'hex');
    const keys = await deriveBundleKeys(key, keyInfo, payload.length);
    const ciphertext = butil.xorBuffers(payload, keys.xorKey);
    const hmac = crypto.createHmac(HASH_ALGORITHM, keys.hmacKey);
    hmac.update(ciphertext);
    const mac = hmac.digest();
    return Buffer.concat([ciphertext, mac]).toString('hex');
  },

  // Decrypt the given hex string into a buffer of plaintext data.
  //
  async unbundle(key, keyInfo, payload) {
    key = Buffer.from(key, 'hex');
    payload = Buffer.from(payload, 'hex');
    const ciphertext = payload.slice(0, -32);
    const expectedHmac = payload.slice(-32);
    const keys = await deriveBundleKeys(key, keyInfo, ciphertext.length);
    const hmac = crypto.createHmac(HASH_ALGORITHM, keys.hmacKey);
    hmac.update(ciphertext);
    const mac = hmac.digest();
    if (!butil.buffersAreEqual(mac, expectedHmac)) {
      throw error.invalidSignature();
    }
    return butil.xorBuffers(ciphertext, keys.xorKey).toString('hex');
  },
};

// Derive the HMAC and XOR keys required to encrypt a given size of payload.
//
async function deriveBundleKeys(key, keyInfo, payloadSize) {
  const keyMaterial = await hkdf(key, keyInfo, null, 32 + payloadSize);
  return {
    hmacKey: keyMaterial.slice(0, 32),
    xorKey: keyMaterial.slice(32),
  };
}
