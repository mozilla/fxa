/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as jose from 'node-jose';

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
    bundle = jose.util.asBuffer(bundle);
    const appJwk = jose.util.base64url.decode(appPublicKeyJwk);

    const key = await jose.JWK.asKey(appJwk);

    // To help reliers do the right thing, we reject keys that aren't exactly as we expect.
    // In the future we might open up to additional key types, but for now it's better to
    // be strict in what we accept.
    if (key.kty !== 'EC') {
      throw new Error('appJwk is not an EC key');
    }
    if (key.get('crv') !== 'P-256') {
      throw new Error('appJwk is not on curve P-256');
    }
    if (key.has('d', true)) {
      throw new Error('appJwk includes the private key');
    }
    const recipient = {
      key: key,
      header: {
        alg: 'ECDH-ES',
      },
    };

    const jwe = jose.JWE.createEncrypt(
      {
        format: 'compact',
        contentAlg: 'A256GCM',
      },
      recipient
    );

    return jwe.update(bundle).final();
  }
}
