/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as jose from 'jose';

/**
 * Scoped key deriver utilities
 * @module deriver-DeriverUtils
 * @private
 */
export class DeriverUtils {
  /**
   * @method encryptBundle
   * @param {string} appPublicKeyJwk - base64url encoded string of the public key JWK
   * @param {string} bundle - String bundle to encrypt using the provided key
   * @returns {Promise}
   */
  async encryptBundle(appPublicKeyJwk: string, bundle: string) {
    const rawKey = jose.decodeJwt('.' + appPublicKeyJwk + '.');
    const key = await jose.importJWK(rawKey);

    // To help reliers do the right thing, we reject keys that aren't exactly as we expect.
    // In the future we might open up to additional key types, but for now it's better to
    // be strict in what we accept.
    if (rawKey.kty !== 'EC') {
      throw new Error('appJwk is not an EC key');
    }
    if (rawKey.crv !== 'P-256') {
      throw new Error('appJwk is not on curve P-256');
    }
    if ('d' in rawKey) {
      throw new Error('appJwk includes the private key');
    }

    return new jose.CompactEncrypt(new TextEncoder().encode(bundle))
      .setProtectedHeader({
        alg: 'ECDH-ES',
        enc: 'A256GCM',
        kid: rawKey.kid as any,
      })
      .encrypt(key);
  }
}
