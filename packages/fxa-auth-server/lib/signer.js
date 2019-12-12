/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const jwtool = require('fxa-jwtool');

module.exports = function(secretKeyFile, domain) {
  const key = jwtool.JWK.fromFile(secretKeyFile, { iss: domain });

  return {
    sign: async function(data) {
      const now = Date.now();
      const cert = await key.sign({
        'public-key': data.publicKey,
        principal: {
          email: data.email,
        },
        iat: now - 10 * 1000,
        exp: now + data.duration,
        'fxa-generation': data.generation,
        'fxa-lastAuthAt': data.lastAuthAt,
        'fxa-verifiedEmail': data.verifiedEmail,
        'fxa-deviceId': data.deviceId,
        'fxa-tokenVerified': data.tokenVerified,
        'fxa-amr': data.authenticationMethods,
        'fxa-aal': data.authenticatorAssuranceLevel,
        'fxa-profileChangedAt': data.profileChangedAt,
        'fxa-keysChangedAt': data.keysChangedAt,
      });
      return { cert };
    },
  };
};
