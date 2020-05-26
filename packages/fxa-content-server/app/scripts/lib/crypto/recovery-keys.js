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
import a256gcm from './a256gcm';
import Base32 from './base32';
import hkdf from './hkdf';
import required from '../required';

const RECOVERY_KEY_VERSION = 'A';

function getRecoveryKeyVersion() {
  return RECOVERY_KEY_VERSION;
}

export default {
  /**
   * Generate a random base32 recovery key. The recovery key
   * string is prepended with version information.
   *
   * @param {Integer} length Length of string to generate (default 32 length)
   * @returns {Promise<string>} recovery key
   */
  generateRecoveryKey: function (length = 32) {
    return Promise.resolve().then(() => {
      if (length < 27) {
        throw new Error('Recovery key length must be at least 27');
      }
      return Base32.generate(length - 1).then((key) => {
        return getRecoveryKeyVersion() + key;
      });
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
    return Promise.resolve().then(() => {
      required(uid, 'uid');
      required(recoveryKey, 'recoveryKey');

      return Base32.decode(recoveryKey).then((keyMaterial) => {
        const salt = Buffer.from(uid, 'hex');
        const keyInfo = Buffer.from('fxa recovery encrypt key', 'utf8');
        const kidInfo = Buffer.from('fxa recovery fingerprint', 'utf8');

        return Promise.all([
          hkdf(keyMaterial, salt, keyInfo, 32),
          hkdf(keyMaterial, salt, kidInfo, 16),
        ]).then((result) => {
          const recoveryKeyId = result[1].toString('hex');
          return a256gcm.createJwkFromKey(result[0], recoveryKeyId);
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
    return Promise.resolve().then(() => {
      required(recoveryJwk, 'recoveryJwk');

      return a256gcm.encrypt(
        JSON.stringify(recoveryData),
        recoveryJwk,
        options
      );
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
    return Promise.resolve().then(() => {
      required(recoveryJwk, 'recoveryJwk');
      required(recoveryBundle, 'recoveryBundle');

      return a256gcm
        .decrypt(recoveryBundle, recoveryJwk)
        .then((result) => JSON.parse(result))
        .catch((err) => {
          // This error will not be surfaced to views
          if (err.name === 'OperationError') {
            throw new Error('Failed to unbundle recovery data');
          }
          throw err;
        });
    });
  },
};
