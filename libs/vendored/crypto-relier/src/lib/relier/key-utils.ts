/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as jose from 'node-jose';

/**
 * Scoped key utilities
 * @module relier-KeyUtils
 * @private
 */
export class KeyUtils {
  /**
   * @constructor
   */
  constructor(public keystore: any = null) {}
  /**
   * @method createApplicationKeyPair
   * @desc Returns a JWK public key
   * @returns {Promise}
   */
  async createApplicationKeyPair() {
    const keystore = jose.JWK.createKeyStore();
    const keyPair = await keystore.generate('EC', 'P-256');
    this.keystore = keystore;

    return {
      jwkPublicKey: keyPair.toJSON(),
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

    const decryptedBundle = await jose.JWE.createDecrypt(this.keystore).decrypt(
      bundle
    );
    return JSON.parse(jose.util.utf8.encode(decryptedBundle.plaintext));
  }
}
