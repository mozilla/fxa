/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Crypto methods used for Account Ecosystem Telemetry.
 */

import importFxaCryptoDeriver from './deriver';
import required from '../required';
import ScopedKeys from './scoped-keys';
import util from './util';

/**
 * Given a user's `kB` and a pipeline public key, derive the user's
 * ecosystem_user_id and encrypt it with the pipeline key, yielding the
 * ecosystem_anon_id. Return a promise that resolves to the ecosystem_anon_id.
 *
 * @param {String} uid - user's UID
 * @param {String} kB - user's kB
 * @param {String} pipelineKey - a pipeline public key in JWK format
 * @returns {Promise} A promise that will be fulfilled with the user's
 * ecosystem_anon_id in JWK format
 */
const generateEcosystemAnonID = async (uid, kB, pipelineKey) => {
  required(uid, 'uid');
  required(kB, 'kB');
  required(pipelineKey, 'pipelineKey');

  const fxaCryptoDeriver = await importFxaCryptoDeriver();
  const fxaDeriverUtils = new fxaCryptoDeriver.DeriverUtils();

  const keyData = {
    identifier: 'https://identity.mozilla.com/ids/ecosystem_telemetry',
    // Following fxa-auth-server/lib/oauth/routes/key_data.js#L14-L20, FxA
    // doesn't yet support per-user scoped key rotation; use a block of
    // zeros instead.
    keyRotationSecret:
      '0000000000000000000000000000000000000000000000000000000000000000',
    keyRotationTimestamp: 1595287165358,
  };

  const ecosystemUserJWK = await ScopedKeys.deriveScopedKeys(kB, uid, keyData);

  // Pull out just the 32 bytes used as eco_uid from the scoped key, then
  // transform from urlsafe base64 to hex encoding, because the data pipeline
  // expects the identifier in hex.
  const ecosystemUserIDRaw = util.base64urlToUint8Array(ecosystemUserJWK.k);
  const ecosystemUserID = util.uint8ToHex(ecosystemUserIDRaw);

  // The node-jose code called by the deriver expects a base64-encoded key.
  const encodedKey = fxaCryptoDeriver.jose.util.base64url.encode(
    JSON.stringify(pipelineKey),
    'utf8'
  );

  const ecosystemAnonID = await fxaDeriverUtils.encryptBundle(
    encodedKey,
    ecosystemUserID
  );

  return ecosystemAnonID;
};

export default {
  generateEcosystemAnonID,
};
