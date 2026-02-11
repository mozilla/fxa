/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// NOTE: Ported from scoped-keys.js in content server. Minor typescript adaptions applied.

import fxaCryptoDeriver from './deriver';

/**
 * Derive scoped keys and create an encrypted bundle for key transport
 *
 * @param {String} kB - Account key for class b data, used to derive scoped keys
 * @param {String} uid - Account UID
 * @param {Object} scopedKeyData - OAuth client data that is required to derive keys
 * @param {Object} keysJwk - Public key used for scoped key encryption
 * @returns {Promise} A promise that will resolve into an encrypted bundle of scoped keys
 */
export async function createEncryptedBundle(
  kB: string,
  uid: string,
  scopedKeyData: Record<string, any>,
  keysJwk: string
) {
  const deriveKeys = Object.keys(scopedKeyData).map(
    async (key) => await deriveScopedKeys(kB, uid, scopedKeyData[key])
  );

  return Promise.all(deriveKeys).then(async (derivedKeys) => {
    const bundleObject: any = {};

    derivedKeys.forEach((derivedKey: any) => {
      bundleObject[derivedKey.scope] = derivedKey;
    });

    return await encryptBundle(bundleObject, keysJwk);
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
async function encryptBundle(bundleObject: any, keysJwk: any) {
  const cryptoDeriver = await fxaCryptoDeriver();
  const fxaDeriverUtils = new cryptoDeriver.DeriverUtils();
  return fxaDeriverUtils.encryptBundle(keysJwk, JSON.stringify(bundleObject));
}

/**
 * Given an inputKey, generate the matching relier-specific derived scoped key.
 *
 * @param {Object} inputKey - Key used to derive from
 * @param {String} uid - Account UID
 * @param {Object} keyData - OAuth client data that is required to derive keys
 * @returns {Promise} A promise that will resolve with an object having a scoped key
 *   The key is represented as a JWK object.
 */
async function deriveScopedKeys(inputKey: any, uid: string, keyData: any) {
  required(inputKey, 'input key');
  required(uid, 'uid');
  required(keyData, 'key data');

  const cryptoDeriver = await fxaCryptoDeriver();
  const scopedKeys = new cryptoDeriver.ScopedKeys();

  return scopedKeys.deriveScopedKey({
    identifier: keyData.identifier,
    inputKey: inputKey,
    keyRotationSecret: keyData.keyRotationSecret,
    keyRotationTimestamp: keyData.keyRotationTimestamp,
    uid: uid,
  });
}

function required(object: any, name: string) {
  if (typeof object === 'undefined') {
    throw new Error(`${name} is required`);
  }
}
