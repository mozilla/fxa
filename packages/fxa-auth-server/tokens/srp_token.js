/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Domain = require('domain')
var crypto = require('crypto')

module.exports = function (log, P, uuid, srp, error) {

  var alg = 'sha256'

  function SrpToken() {
    this.id = null
    this.uid = null
    this.N = null
    this.g = null
    this.s = null
    this.v = null
    this.b = null
    this.B = null
    this.K = null
    this.passwordStretching = null
  }

  function srpGenKey() {
    var d = P.defer()
    // capturing the domain here is a workaround for:
    // https://github.com/joyent/node/issues/3965
    var domain = process.domain
    crypto.randomBytes(32,
      function (err, bytes) {
        if (domain) domain.enter()
        var x = err ? d.reject(err) : d.resolve(bytes)
        if (domain) domain.exit()
        return x
      }
    )
    return d.promise
  }

  SrpToken.create = function (account) {
    log.trace({ op: 'SrpToken.create', uid: account && account.uid })
    var t = null
    return srpGenKey()
      .then(
        function (b) {
          t = new SrpToken()
          t.id = uuid.v4()
          t.uid = account.uid
          t.N = srp.params[2048].N
          t.g = srp.params[2048].g
          t.s = account.srp.salt
          t.v = Buffer(account.srp.verifier, 'hex')
          t.b = b
          t.B = srp.getB(t.v, t.g, b, t.N, alg)
          t.passwordStretching = account.passwordStretching
          return t
        }
      )
  }

  SrpToken.prototype.finish = function (A, M1) {
    A = Buffer(A, 'hex')
    var N = srp.params[2048].N
    var S = srp.server_getS(
      Buffer(this.s, 'hex'),
      this.v,
      N,
      srp.params[2048].g,
      A,
      this.b,
      alg
    )
    var M2 = srp.getM(A, this.B, S, N)
    if (M1 !== M2.toString('hex')) {
      // TODO: increment bad guess counter
      // TODO: delete this?
      throw error.incorrectPassword()
    }
    this.K = srp.getK(S, N, alg)
    return this
  }

  SrpToken.prototype.clientData = function () {
    return {
      srpToken: this.id,
      passwordStretching: this.passwordStretching,
      srp: {
        type: 'SRP-6a/SHA256/2048/v1',
        salt: this.s,
        B: this.B.toString('hex')
      }
    }
  }

  SrpToken.client2 = function (session, email, password) {
    return srpGenKey()
      .then(
        function (a) {
          var N = srp.params[2048].N
          var g = srp.params[2048].g
          var A = srp.getA(g, a, N)
          var B = Buffer(session.srp.B, 'hex')
          var S = srp.client_getS(
            Buffer(session.srp.salt, 'hex'),
            Buffer(email),
            Buffer(password),
            N,
            g,
            a,
            B,
            session.srp.alg
          )

          var M = srp.getM(A, B, S, N)
          var K = srp.getK(S, N, 'sha256')
          return {
            A: A.toString('hex'),
            M: M.toString('hex'),
            K: K.toString('hex')
          }
        }
      )
  }

  return SrpToken
}
