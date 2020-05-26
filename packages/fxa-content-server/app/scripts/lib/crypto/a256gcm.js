/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import importFxaCryptoDeriver from './deriver';
import required from '../required';

const ENCRYPTION_ALGORITHM = 'A256GCM';

export default {
  /**
   * Create a JWK from `key` and `kid`. `key`
   * is the output of hdkf (see ./hkdf.js)
   *
   * @param {Buffer} key
   * @param {Object} [kid]
   * @returns {Promise} resolves to the JWK
   */
  createJwkFromKey(key, kid) {
    return importFxaCryptoDeriver().then(({ jose }) => {
      required(key, 'key');

      const keyOptions = {
        alg: ENCRYPTION_ALGORITHM,
        k: key,
        kty: 'oct',
      };

      if (typeof kid !== 'undefined') {
        keyOptions.kid = kid;
      }

      return jose.JWK.asKey(keyOptions);
    });
  },

  /**
   * encrypts `plaintext` using `keysJwk`
   *
   * @param {String} plaintext Data to encrypt
   * @param {String} keysJwk keysJwk to encrypt data
   * @param {Object} [options={}] Options
   *   @param {String} [options.unsafeExplicitIV] - Initialization vector used to create bundle for testing purposes
   * @returns {Promise} A promise that will be fulfilled with the encrypted data
   */
  encrypt: function (plaintext, keysJwk, options = {}) {
    return importFxaCryptoDeriver().then(({ jose }) => {
      required(plaintext, 'plaintext');
      required(keysJwk, 'keysJwk');

      const recipient = {
        header: {
          alg: 'dir',
          enc: ENCRYPTION_ALGORITHM,
        },
        key: keysJwk,
      };

      const encryptOptions = {
        contentAlg: ENCRYPTION_ALGORITHM,
        format: 'compact',
      };

      if (options.unsafeExplicitIV) {
        encryptOptions.iv = jose.util.base64url.encode(
          options.unsafeExplicitIV,
          'hex'
        );
      }

      return jose.JWE.createEncrypt(encryptOptions, recipient)
        .update(plaintext)
        .final();
    });
  },

  /**
   * Decrypt `ciphertext` using `keysJwk`.
   *
   * @param {String} ciphertext Base64 encoded and encrypted ciphertext
   * @param {String} keysJwk keysJwk used to decrypt data
   * @returns {Promise} A promise that will be fulfilled with the ciphertext
   */
  decrypt: function (ciphertext, keysJwk) {
    return importFxaCryptoDeriver().then(({ jose }) => {
      required(ciphertext, 'ciphertext');
      required(keysJwk, 'keysJwk');

      const opts = {
        algorithms: ['dir', ENCRYPTION_ALGORITHM],
      };

      return jose.JWE.createDecrypt(keysJwk, opts)
        .decrypt(ciphertext)
        .then((result) => result.plaintext.toString());
    });
  },
};
