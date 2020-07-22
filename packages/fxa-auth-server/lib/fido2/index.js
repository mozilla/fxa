/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {
  generateRegistrationChallenge,
  parseRegistrationRequest,
  generateLoginChallenge,
  parseLoginRequest,
  verifyAuthenticator,
} = require('./registration-login');

exports.generateRegistrationChallenge = generateRegistrationChallenge;
exports.generateLoginChallenge = generateLoginChallenge;
exports.parseRegistrationRequest = parseRegistrationRequest;
exports.parseLoginRequest = parseLoginRequest;
exports.verifyAuthenticator = verifyAuthenticator;
