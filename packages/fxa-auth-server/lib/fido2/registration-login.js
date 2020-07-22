/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const cbor = require('cbor');
const { randomBase64Buff, parseBrowserBuffer } = require('./utils');
const {
  challengeFromClientData,
  validateRegistration,
  validateLogin,
} = require('./challenge');
const { parseU2FKey, validateU2FKey } = require('./keys/u2fKey');
const { parsePackedKey, validatePackedKey } = require('./keys/packed');

/**
 * Generate and Validate Registration Challenge
 */

// Check Authenticator Keys
const parseAuthenticatorKey = (response) => {
  const authenticatorKeyBuffer = Buffer.from(
    response.attestationObject,
    'base64'
  );
  const authenticatorKey = cbor.decodeAllSync(authenticatorKeyBuffer)[0];

  // Check for FIDO-U2F
  if (authenticatorKey.fmt === 'fido-u2f') {
    return parseU2FKey(authenticatorKey, response.clientDataJSON);
  }
  //Check for FIDO-Packed
  if (authenticatorKey.fmt === 'packed') {
    return parsePackedKey(authenticatorKey, response.clientDataJSON);
  }
  return undefined;
};

// Generate Resgistration Challenge
// Authenticator: Cross Platform
// Attestation: Direct
exports.generateRegistrationChallenge = ({
  relyingParty,
  user,
  authenticator = 'cross-platform',
  attestation = 'direct',
} = {}) => {
  if (
    !relyingParty ||
    !relyingParty.name ||
    typeof relyingParty.name !== 'string'
  ) {
    throw new Error('The typeof relyingParty.name should be a string');
  }

  if (
    !user ||
    !user.id ||
    !user.name ||
    typeof user.id !== 'string' ||
    typeof user.name !== 'string'
  ) {
    throw new Error('The user should have an id (string) and a name (string)');
  }

  // Platform check
  if (!['cross-platform', 'platform'].includes(authenticator)) {
    authenticator = 'cross-platform';
  }

  // Attestation support
  if (!['none', 'direct', 'indirect'].includes(attestation)) {
    attestation = 'direct';
  }

  return {
    challenge: randomBase64Buff(32),
    rp: {
      id: relyingParty.id,
      name: relyingParty.name,
    },
    user: {
      id: Buffer.from(user.id).toString('base64'),
      displayName: user.displayName || user.name,
      name: user.name,
    },
    attestation,
    pubKeyCredParams: [
      {
        type: 'public-key',
        alg: -7, // "ES256" IANA COSE Algorithms registry
      },
    ],
    authenticatorSelection: {
      authenticatorAttachment: authenticator,
    },
  };
};

// Parse Registration Request
exports.parseRegistrationRequest = (body) => {
  if (!validateRegistration(body)) {
    return {};
  }
  const challenge = challengeFromClientData(body.response.clientDataJSON);
  const key = parseAuthenticatorKey(body.response);

  return {
    challenge,
    key,
  };
};

/**
 * Generate and Validate Login Challenge
 */

// Verify authenticator
exports.verifyAuthenticator = (data, key) => {
  const authenticatorDataBuffer = Buffer.from(
    data.response.authenticatorData,
    'base64'
  );

  if (key.fmt === 'fido-u2f') {
    return validateU2FKey(
      authenticatorDataBuffer,
      key,
      data.response.clientDataJSON,
      data.response.signature
    );
  }

  if (key.fmt === 'packed') {
    return validatePackedKey(
      authenticatorDataBuffer,
      key,
      data.response.clientDataJSON,
      data.response.signature
    );
  }
  return false;
};

// Generate Login Challenge
exports.generateLoginChallenge = (key) => {
  // convert key to array
  const keys = [].concat(key);
  const allowCredentials = keys.map(({ credID }) => ({
    type: 'public-key',
    id: credID,
    // Add transports support
    transports: ['usb', 'nfc', 'ble'],
  }));

  return {
    challenge: randomBase64Buff(32),
    allowCredentials,
  };
};

// Parse Login Challenge
exports.parseLoginRequest = (body) => {
  if (!validateLogin(body)) {
    return {};
  }
  const challenge = challengeFromClientData(body.response.clientDataJSON);
  const keyId = parseBrowserBuffer(body.id);

  return {
    challenge,
    keyId,
  };
};
