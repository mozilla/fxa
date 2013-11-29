/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, inherits, P, uuid, srp, Bundle, Token, error) {

  function SrpToken(keys, details) {
    if (!details.srp) { details.srp = {} }
    Token.call(this, keys, details)
    this.b = this.bundleKey
    this.v = details.srp.verifier ? Buffer(details.srp.verifier, 'hex') : null
    this.s = details.srp.salt ? details.srp.salt : null
    this.passwordStretching = details.passwordStretching || null
    this.srpServer = new srp.Server(srp.params[2048], this.v, this.b)
    this.K = null
  }
  inherits(SrpToken, Token)

  SrpToken.tokenTypeID = 'srpToken'

  SrpToken.create = function (details) {
    log.trace({ op: 'SrpToken.create', uid: details && details.uid })
    return Token.createNewToken(SrpToken, details || {})
  }

  SrpToken.fromHex = function (string, details) {
    log.trace({ op: 'SrpToken.create', uid: details && details.uid })
    return Token.createTokenFromHexData(SrpToken, string, details || {})
  }

  // Get the data to be sent back to the client in the first message.
  //
  SrpToken.prototype.clientData = function () {
    return {
      srpToken: this.id.toString('hex'),
      passwordStretching: this.passwordStretching,
      srp: {
        type: 'SRP-6a/SHA256/2048/v1',
        salt: this.s,
        B: this.srpServer.computeB().toString('hex')
      }
    }
  }

  // Complete the SRP dance, verifying the correct credentials and
  // deriving the value of the shared secret.
  //
  SrpToken.prototype.finish = function (A, M1) {
    A = Buffer(A, 'hex')
    this.srpServer.setA(A)
    try {
      this.srpServer.checkM1(Buffer(M1, 'hex'))
    }
    catch (e) {
      throw error.incorrectPassword()
    }
    this.K = this.srpServer.computeK()
    return this
  }

  SrpToken.prototype.bundleAuth = function (authToken) {
    log.trace({ op: 'srpToken.bundleAuth', id: this.id, auth: authToken })
    if (!this.K) {
      return P.reject('Shared secret missing; SRP handshake was not completed')
    }
    return Bundle.bundle(this.K, 'auth/finish', authToken)
  }

  SrpToken.prototype.unbundleAuth = function (bundle) {
    log.trace({ op: 'srpToken.unbundleAuth', id: this.id })
    if (!this.K) {
      return P.reject('Shared secret missing; SRP handshake was not completed')
    }
    return Bundle.unbundle(this.K, 'auth/finish', bundle)
      .then(
        function (plaintext) {
          return {
            authToken: plaintext,
          }
        }
      )
  }

  return SrpToken
}
