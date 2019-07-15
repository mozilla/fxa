/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const P = require('../promise');
const signJWT = P.promisify(require('jsonwebtoken').sign);

const error = require('../error');

module.exports = {
  // The oauth-server's error numbers overlap and conflict
  // with the auth-server's, so we have to map them to new ones.

  mapOAuthError: function mapOAuthError(log, err) {
    // If it's already an instance of our internal error type,
    // then just return it as-is.
    if (err instanceof error) {
      return err;
    }
    if (!err.errno) {
      // If there's no `errno`, it must be some sort of internal implementation error.
      // Let it bubble up and be caught by the top-level unexpected-error-handling logic.
      throw err;
    }
    switch (err.errno) {
      case 101:
        return error.unknownClientId(err.clientId);
      case 102:
        return error.incorrectClientSecret(err.clientId);
      case 103:
        return error.incorrectRedirectURI(err.redirectUri);
      case 104:
        return error.invalidToken();
      case 105:
        return error.unknownAuthorizationCode(err.code);
      case 106:
        return error.mismatchAuthorizationCode(err.code, err.clientId);
      case 107:
        return error.expiredAuthorizationCode(err.code, err.expiredAt);
      case 108:
        return error.invalidToken();
      case 109:
        return error.invalidRequestParameter(err.validation);
      case 110:
        return error.invalidResponseType();
      case 114:
        return error.invalidScopes(err.invalidScopes);
      case 116:
        return error.notPublicClient();
      case 117:
        return error.invalidPkceChallenge(err.pkceHashValue);
      case 118:
        return error.missingPkceParameters();
      case 119:
        return error.staleAuthAt(err.authAt);
      case 120:
        return error.insufficientACRValues(err.foundValue);
      case 122:
        return error.unknownRefreshToken();
      case 201:
        return error.serviceUnavailable(err.retryAfter);
      case 202:
        return error.disabledClientId(err.clientId);
      default:
        log.warn('oauthdb.mapOAuthError', {
          err: err,
          errno: err.errno,
          warning: 'unmapped oauth-server errno',
        });
        return error.unexpectedError();
    }
  },

  // Make a symmetrically-signed JWT assertion that we can pass to
  // fxa-oauth-server in lieu of a full-blown BrowserID assertion.
  // This contains all the same fields as you'd find the "idpClaims"
  // of a BrowserID assertion generated from the same credentials,
  // but as a JWT signed with a simple symmetric key rather than in
  // the significantly-more-convoluted BrowserID format.

  makeAssertionJWT: function makeAssertionJWT(config, credentials) {
    if (!credentials.emailVerified) {
      throw error.unverifiedAccount();
    }
    if (credentials.mustVerify && !credentials.tokenVerified) {
      throw error.unverifiedSession();
    }
    const opts = {
      algorithm: 'HS256',
      expiresIn: 60,
      audience: config.oauth.url,
      issuer: config.domain,
    };
    const claims = {
      sub: credentials.uid,
      'fxa-generation': credentials.verifierSetAt,
      'fxa-verifiedEmail': credentials.email,
      'fxa-lastAuthAt': credentials.lastAuthAt(),
      'fxa-tokenVerified': credentials.tokenVerified,
      'fxa-amr': Array.from(credentials.authenticationMethods),
      'fxa-aal': credentials.authenticatorAssuranceLevel,
    };
    return signJWT(claims, config.oauth.secretKey, opts);
  },
};
