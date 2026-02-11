/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Derive scope-specific keys from account master keys.
 */

import importFxaCryptoDeriver from './deriver';
import required from '../required';

/**
 * Given an inputKey, generate the matching relier-specific derived scoped key.
 *
 * @param {Object} inputKey - Key used to derive from
 * @param {String} uid - Account UID
 * @param {Object} keyData - OAuth client data that is required to derive keys
 * @returns {Promise} A promise that will resolve with an object having a scoped key
 *   The key is represented as a JWK object.
 */
function deriveScopedKeys(inputKey, uid, keyData) {
  return importFxaCryptoDeriver().then((fxaCryptoDeriver) => {
    required(inputKey, 'input key');
    required(uid, 'uid');
    required(keyData, 'key data');

    const scopedKeys = new fxaCryptoDeriver.ScopedKeys();

    return scopedKeys.deriveScopedKey({
      identifier: keyData.identifier,
      inputKey: inputKey,
      keyRotationSecret: keyData.keyRotationSecret,
      keyRotationTimestamp: keyData.keyRotationTimestamp,
      uid: uid,
    });
  });
}

/**
 * Create an encrypted bundle for key transport
 *
 * @param {Object} bundleObject - A bundle of scoped keys
 * @param {Object} keysJwk - Public key used for scoped key encryption
 * without stringifying the `bundleObject`.
 * @returns {Promise} A promise that will resolve into an encrypted bundle of scoped keys
 */
function encryptBundle(bundleObject, keysJwk) {
  return importFxaCryptoDeriver().then((fxaCryptoDeriver) => {
    const fxaDeriverUtils = new fxaCryptoDeriver.DeriverUtils();
    return fxaDeriverUtils.encryptBundle(keysJwk, JSON.stringify(bundleObject));
  });
}

/**
 * Derive scoped keys and create an encrypted bundle for key transport
 *
 * @param {Object} accountKeys - Account keys, used to derive scoped keys
 * @param {String} uid - Account UID
 * @param {Object} scopedKeyData - OAuth client data that is required to derive keys
 * @param {Object} keysJwk - Public key used for scoped key encryption
 * @returns {Promise} A promise that will resolve into an encrypted bundle of scoped keys
 */
function createEncryptedBundle(accountKeys, uid, scopedKeyData, keysJwk) {
  const deriveKeys = Object.keys(scopedKeyData).map((key) =>
    deriveScopedKeys(accountKeys.kB, uid, scopedKeyData[key])
  );

  return Promise.all(deriveKeys).then((derivedKeys) => {
    const bundleObject = {};

    derivedKeys.forEach((derivedKey) => {
      bundleObject[derivedKey.scope] = derivedKey;
    });

    return encryptBundle(bundleObject, keysJwk);
  });
}

export default {
  createEncryptedBundle,
  deriveScopedKeys,
  encryptBundle,
};
