/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import jwksRsa from 'jwks-rsa';

export const strategy = (config) => {
  const shouldValidate = config.pubsub.authenticate;
  const verificationToken = config.pubsub.verificationToken;

  async function validateSender(decoded, request, h) {
    let isValid = true;
    if (shouldValidate) {
      isValid = request.query.token === verificationToken;
    }
    return { isValid };
  }

  return {
    // Get the complete decoded token, because we need info from the header (the kid)
    complete: true,
    key: jwksRsa.hapiJwt2KeyAsync({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
    }),

    // Disable reading token from anything other than the header.
    urlKey: false,
    cookieKey: false,
    payloadKey: false,

    validate: validateSender,

    verifyOptions: {
      audience: config.pubsub.audience,
      issuer: 'https://accounts.google.com',
      algorithms: ['RS256'],
    },
  };
};
