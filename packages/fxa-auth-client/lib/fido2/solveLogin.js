/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const clientUtils = require('./utils');

const loginChallengeToPublicKey = (getAssertion) => {
  return {
    ...getAssertion,
    challenge: Buffer.from(getAssertion.challenge, 'base64'),
    allowCredentials: getAssertion.allowCredentials.map((allowCredential) => ({
      ...allowCredential,
      id: Buffer.from(allowCredential.id, 'base64'),
    })),
  };
};

exports.solveLogin = async (challengeRequest) => {
  const publicKey = loginChallengeToPublicKey(challengeRequest);

  /* global navigator */
  const credentials = await window.navigator.credentials.get({
    publicKey,
  });

  if (!credentials) {
    throw new Error('Assertion was not completed');
  }

  return clientUtils.publicKeyToJSON(credentials);
};

exports.loginChallengeToPublicKey = loginChallengeToPublicKey;
