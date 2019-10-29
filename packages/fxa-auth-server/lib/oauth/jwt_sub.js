/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const hex = require('buf').to.hex;
const hkdf = require('../../lib/crypto/hkdf');
const config = require('../../config');
const validators = require('./validators');

const PPID_ENABLED = config.get('oauthServer.ppid.enabled');
const PPID_CLIENT_IDS = new Set(
  config.get('oauthServer.ppid.enabledClientIds')
);
const PPID_ROTATING_CLIENT_IDS = new Set(
  config.get('oauthServer.ppid.rotatingClientIds')
);
const PPID_ROTATION_PERIOD_MS = config.get('oauthServer.ppid.rotationPeriodMS');
const PPID_SALT = config.get('oauthServer.ppid.salt');
const PPID_INFO = 'oidc ppid sub';

module.exports = async function generateSub(
  userIdBuf,
  clientIdBuf,
  clientSeed = 0
) {
  if (!Buffer.isBuffer(userIdBuf)) {
    throw new Error('invalid userIdBuf');
  }
  if (!Buffer.isBuffer(clientIdBuf)) {
    throw new Error('invalid clientIdBuf');
  }
  if (validators.ppidSeed.validate(clientSeed).error) {
    throw new Error('invalid ppidSeed');
  }

  const clientIdHex = hex(clientIdBuf).toLowerCase();
  const userIdHex = hex(userIdBuf).toLowerCase();

  if (PPID_ENABLED && PPID_CLIENT_IDS.has(clientIdHex)) {
    // Input values used in the HKDF must not contain a `.` to ensure
    // collisions are not possible by manipulating the input.
    // userIdHex is guaranteed to be a hex string and not contain any '.'
    // clientIdHex is guaranteed to be a hex string and not contain any '.'
    // clientSeed is a constrained integer between 0 and 1024. See validators.js->ppidSeed
    let timeBasedContext = 0;
    if (PPID_ROTATING_CLIENT_IDS.has(clientIdHex)) {
      timeBasedContext = Math.floor(Date.now() / PPID_ROTATION_PERIOD_MS);
    }
    return hex(
      await hkdf(
        `${clientIdHex}.${userIdHex}.${clientSeed}.${timeBasedContext}`,
        PPID_INFO,
        PPID_SALT,
        userIdBuf.length
      )
    );
  } else {
    return userIdHex;
  }
};
