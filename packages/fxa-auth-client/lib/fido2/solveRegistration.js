/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const clientUtils = require('./utils');

const registrationChallengeToPublicKey = (getAttest) => {
  return {
    ...getAttest,
    challenge: Buffer.from(getAttest.challenge, 'base64'),
    user: {
      ...getAttest.user,
      id: Buffer.from(getAttest.user.id),
    },
  };
};

exports.solveRegistration = async (challengeRequest) => {
  const publicKey = registrationChallengeToPublicKey(challengeRequest);

  /* global navigator */
  const credentials = await window.navigator.credentials.create({
    publicKey,
  });

  return clientUtils.publicKeyToJSON(credentials);
};

exports.registrationChallengeToPublicKey = registrationChallengeToPublicKey;
