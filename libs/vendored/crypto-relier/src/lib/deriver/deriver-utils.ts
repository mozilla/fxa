/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { base64url, CompactEncrypt, importJWK } from 'jose';
import type { CompactJWEHeaderParameters, JWK } from 'jose';

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
    const appJwk: JWK = JSON.parse(
      new TextDecoder().decode(base64url.decode(appPublicKeyJwk))
    );

    // To help reliers do the right thing, we reject keys that aren't exactly as we expect.
    // In the future we might open up to additional key types, but for now it's better to
    // be strict in what we accept.
    if (appJwk.kty !== 'EC') {
      throw new Error('appJwk is not an EC key');
    }
    if (appJwk.crv !== 'P-256') {
      throw new Error('appJwk is not on curve P-256');
    }
    if (appJwk.d !== undefined) {
      throw new Error('appJwk includes the private key');
    }

    let key;
    try {
      key = await importJWK(appJwk, 'ECDH-ES');
    } catch (err) {
      // Node and WebCrypto use different errors for a point that is not on the curve.
      const { code, name } = err as { code?: string; name?: string };
      if (code === 'ERR_CRYPTO_INVALID_JWK' || name === 'DataError') {
        throw new Error('invalid EC public key');
      }
      throw err;
    }
    // Sync and relying parties expect exactly these header fields: alg, enc, epk and kid.
    const header: CompactJWEHeaderParameters = {
      alg: 'ECDH-ES',
      enc: 'A256GCM',
    };
    if (typeof appJwk.kid === 'string') {
      header.kid = appJwk.kid;
    }

    return new CompactEncrypt(new TextEncoder().encode(bundle))
      .setProtectedHeader(header)
      .encrypt(key);
  }
}
