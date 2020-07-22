/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.validateCredentials = (credentials) => {
  if (
    !credentials.id ||
    !credentials.rawId ||
    !credentials.type ||
    credentials.type !== 'public-key' ||
    !credentials.response ||
    !credentials.response.clientDataJSON
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
  validateCredentials(credentials) && !!credentials.response.attestationObject;

exports.validateLogin = (credentials) =>
  validateCredentials(credentials) && credentials.response.authenticatorData;
