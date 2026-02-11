/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { JWTool, PrivateJWK } from '@fxa/vendored/jwtool';

export default function (secretKeyFile: string, domain: string) {
  const key = JWTool.JWK.fromFile(secretKeyFile, { iss: domain }) as PrivateJWK;

  return {
    sign: async function (data: any) {
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
}
