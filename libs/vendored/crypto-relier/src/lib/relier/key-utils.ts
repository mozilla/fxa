/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  calculateJwkThumbprint,
  compactDecrypt,
  exportJWK,
  generateKeyPair,
} from 'jose';
import type { KeyLike } from 'jose';

/**
 * Scoped key utilities
 * @module relier-KeyUtils
 * @private
 */
export class KeyUtils {
  /**
   * @constructor
   */
  constructor(public keystore: KeyLike | Uint8Array | null = null) {}
  /**
   * @method createApplicationKeyPair
   * @desc Returns a JWK public key
   * @returns {Promise}
   */
  async createApplicationKeyPair() {
    const { publicKey, privateKey } = await generateKeyPair('ECDH-ES', {
      crv: 'P-256',
    });
    this.keystore = privateKey;

    const jwkPublicKey = await exportJWK(publicKey);
    jwkPublicKey.kid = await calculateJwkThumbprint(jwkPublicKey);

    return {
      jwkPublicKey,
    };
  }
  /**
   * @method decryptBundle
   * @desc Decrypts a given bundle using the JWK key store
   * @param {string} bundle
   * @returns {Promise}
   */
  async decryptBundle(bundle: string) {
    if (!this.keystore) {
      throw new Error(
        'No Key Store. Use .createApplicationKeyPair() to create it first.'
      );
    }

    const { plaintext } = await compactDecrypt(bundle, this.keystore, {
      keyManagementAlgorithms: ['ECDH-ES'],
      contentEncryptionAlgorithms: ['A256GCM'],
    });
    return JSON.parse(new TextDecoder().decode(plaintext));
  }
}
