/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const P = require('../promise')
const signJWT = P.promisify(require('jsonwebtoken').sign)

const error = require('../error')

module.exports = {

  // The oauth-server's error numbers overlap and conflict
  // with the auth-server's, so we have to map them to new ones.

  mapOAuthError: function mapOAuthError(log, err) {
    // If it's already an instance of our internal error type,
    // then just return it as-is.
    if (err instanceof error) {
      return err
    }
    switch (err.errno) {
    case 101:
      return error.unknownClientId(err.clientId)
    case 119:
      return error.staleAuthAt(err.authAt)
    default:
      log.warn({
        op: 'oauthdb.mapOAuthError',
        err: err,
        errno: err.errno,
        warning: 'unmapped oauth-server errno'
      })
      return error.unexpectedError()
    }
  },

  // Make a symmetrically-signed JWT assertion that we can pass to
  // fxa-oauth-server in lieu of a full-blown BrowserID assertion.
  // This contains all the same fields as you'd find the "idpClaims"
  // of a BrowserID assertion generated from the same credentials,
  // but as a JWT signed with a simple symmetric key rather than in
  // the significantly-more-convoluted BrowserID format.

  makeAssertionJWT: function makeAssertionJWT(config, credentials) {
    if (! credentials.emailVerified) {
      throw error.unverifiedAccount()
    }
    if (credentials.mustVerify && ! credentials.tokenVerified) {
      throw error.unverifiedSession()
    }
    const opts = {
      algorithm: 'HS256',
      expiresIn: 60,
      audience: config.oauth.url,
      issuer: config.domain
    }
    const claims = {
      'sub': credentials.uid,
      'fxa-generation': credentials.verifierSetAt,
      'fxa-verifiedEmail': credentials.email,
      'fxa-lastAuthAt': credentials.lastAuthAt(),
      'fxa-tokenVerified': credentials.tokenVerified,
      'fxa-amr': Array.from(credentials.authenticationMethods),
      'fxa-aal': credentials.authenticatorAssuranceLevel
    }
    return signJWT(claims, config.oauth.secretKey, opts)
  }
}
