/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const validateCredentials = (credentials) => {
  if (
    !credentials.credentials.id ||
    !credentials.credentials.rawId ||
    !credentials.credentials.type ||
    credentials.credentials.type !== 'public-key' ||
    !credentials.credentials.response ||
    !credentials.credentials.response.clientDataJSON
  ) {
    return false;
  }
  return true;
};

exports.challengeFromClientData = (clientDataJSON) => {
  const clientDataBuffer = Buffer.from(clientDataJSON, 'base64');
  const clientData = JSON.parse(clientDataBuffer.toString());
  const challenge = Buffer.from(clientData.challenge, 'base64');
  return challenge.toString('base64');
};

exports.validateRegistration = (credentials) =>
  validateCredentials(credentials) && !!credentials.credentials.response.attestationObject;

exports.validateLogin = (credentials) =>
  validateCredentials(credentials) && credentials.credentials.response.authenticatorData;

exports.validateCredentials = validateCredentials;
