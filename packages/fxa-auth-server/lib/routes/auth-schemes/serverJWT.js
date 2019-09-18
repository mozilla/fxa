/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { verifyJWT } = require('../../serverJWT');

// the serverJWT scheme is used to authenticate requests between
// from the OAuth to Auth server using a JWT in the authorization
// header. The authorization header must have the `OAuthJWT` prefix

module.exports = function schemeServerJWTScheme(audience, issuer, keys, error) {
  return function schemeServerJWT(server, options) {
    return {
      async authenticate(request, h) {
        // Trying to re-use "Bearer" as the prefix failed, Hapi thought
        // we were trying to use normal OAuth tokens. So, a new prefix.
        if (!/^OAuthJWT /.test(request.headers.authorization)) {
          throw error.invalidToken();
        }

        const jwt = request.headers.authorization.replace('OAuthJWT ', '');
        let claims;
        try {
          claims = await verifyJWT(jwt, audience, issuer, keys);
        } catch (e) {
          throw error.invalidToken();
        }

        return h.authenticated({
          credentials: {
            client_id: claims.client_id,
            scope: claims.scope.split(/\s+/),
            user: claims.sub,
          },
        });
      },
    };
  };
};
