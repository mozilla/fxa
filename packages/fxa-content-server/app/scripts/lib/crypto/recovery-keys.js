/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This file contains utilities to help create, bundle and unbundle encrypted
 * recovery key data.
 *
 * For more encryption details, check out
 + https://github.com/mozilla/fxa-auth-server/blob/master/docs/recovery_keys.md
 */
const Base32 = require('./base32');

function importFxaCryptoDeriver() {
  return import(/* webpackChunkName: "fxaCryptoDeriver" */ 'fxaCryptoDeriver');
}

function required(object, name) {
  if (! object) {
    throw new Error(`Missing ${name}`);
  }
}

const RECOVERY_KEY_VERSION = 'A';
const ENCRYPTION_ALGORITHM = 'A256GCM';
const HKDF_SHA_256 = 'HKDF-SHA-256';

function getRecoveryKeyVersion() {
  return RECOVERY_KEY_VERSION;
}

module.exports = {
  /**
   * Generate a random base32 recovery key. The recovery key
   * string is prepended with version information.
   *
   * @param {Integer} length Length of string to generate (default 32 length)
   * @returns {Promise<string>} recovery key
   */
  generateRecoveryKey: function (length = 32) {
    return Base32.generate(length - 1)
      .then((key) => {
        return getRecoveryKeyVersion() + key;
      });
  },

  /**
   * Get the current version of the recovery keys.
   *
   * @returns {string} current recovery key version
   */
  getCurrentRecoveryKeyVersion: function () {
    return getRecoveryKeyVersion();
  },

  /**
   * Generates the recovery JWK from the uid and recovery key. The
   * recoveryJwk can be used to encrypt and decrypt data.
   *
   * @param {String} uid Uid of user
   * @param {String} recoveryKey Recovery key
   * @returns {Promise} A promise that will be fulfilled with JWK
   */
  getRecoveryJwk: function (uid, recoveryKey) {
    return importFxaCryptoDeriver().then(({jose}) => {
      required(uid, 'uid');
      required(recoveryKey, 'recoveryKey');

      return Base32.decode(recoveryKey)
        .then((keyMaterial) => {
          const salt = Buffer.from(uid, 'hex');
          const options = {
            info: Buffer.from('fxa recovery encrypt key', 'utf8'),
            length: 32,
            salt
          };
          const optionsKid = {
            info: Buffer.from('fxa recovery fingerprint', 'utf8'),
            length: 16,
            salt
          };
          return Promise.all([jose.JWA.derive(HKDF_SHA_256, keyMaterial, options), jose.JWA.derive(HKDF_SHA_256, keyMaterial, optionsKid)])
            .then((result) => {
              const recoveryKeyId = result[1].toString('hex');
              const keyOptions = {
                alg: ENCRYPTION_ALGORITHM,
                k: jose.util.base64url.encode(result[0], 'hex'),
                kid: recoveryKeyId,
                kty: 'oct'
              };
              return jose.JWK.asKey(keyOptions);
            });
        });
    });
  },

  /**
   * Creates an encrypted bundle for the users's recovery data. This data
   * should contain the user's original kB.
   *
   * @param {String} recoveryJwk Recovery JWK used to encrypt data
   * @param {Object} recoveryData Data to encrypt
   * @param {Object} [options={}] Options
   *   @param {String} [options.unsafeExplicitIV] - Initialization vector used to create bundle for testing purposes
   * @returns {Promise} A promise that will be fulfilled with the encrypted recoveryData
   */
  bundleRecoveryData: function (recoveryJwk, recoveryData, options = {}) {
    return importFxaCryptoDeriver().then(({jose}) => {
      required(recoveryJwk, 'recoveryJwk');

      const recipient = {
        header: {
          alg: 'dir',
          enc: ENCRYPTION_ALGORITHM
        },
        key: recoveryJwk
      };
      const encryptOptions = {
        contentAlg: ENCRYPTION_ALGORITHM,
        format: 'compact'
      };

      if (options.unsafeExplicitIV) {
        encryptOptions.iv = jose.util.base64url.encode(options.unsafeExplicitIV, 'hex');
      }

      return jose.JWE.createEncrypt(encryptOptions, recipient)
        .update(JSON.stringify(recoveryData))
        .final();
    });
  },

  /**
   * Unbundle the encoded recovery data using the recoveryJwk.
   *
   * @param {String} recoveryJwk RecoveryJwk used to decrypt data
   * @param {String} recoveryBundle Base64 encoded and encrypted recovery data
   * @returns {Promise} A promise that will be fulfilled with the decoded recoveryData
   */
  unbundleRecoveryData: function (recoveryJwk, recoveryBundle) {
    return importFxaCryptoDeriver().then(({jose}) => {
      required(recoveryJwk, 'recoveryJwk');
      required(recoveryBundle, 'recoveryBundle');

      const opts = {
        algorithms: ['dir', ENCRYPTION_ALGORITHM]
      };

      return jose.JWE.createDecrypt(recoveryJwk, opts)
        .decrypt(recoveryBundle)
        .then((result) => JSON.parse(result.plaintext.toString()))
        .catch((err) => {
          // This error will not be surfaced to views
          if (err.name === 'OperationError') {
            throw new Error('Failed to unbundle recovery data');
          }
          throw err;
        });
    });
  }
};
