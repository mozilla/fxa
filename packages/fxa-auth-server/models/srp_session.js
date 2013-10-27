/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Domain = require('domain')
var crypto = require('crypto')

module.exports = function (log, P, uuid, srp, error) {

  var alg = 'sha256'

  function SrpSession() {
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

  SrpSession.create = function (account) {
    log.trace({ op: 'SrpSession.create', uid: account && account.uid })
    var session = null
    return srpGenKey()
      .then(
        function (b) {
          session = new SrpSession()
          session.id = uuid.v4()
          session.uid = account.uid
          session.N = srp.params[2048].N
          session.g = srp.params[2048].g
          session.s = account.srp.salt
          session.v = Buffer(account.srp.verifier, 'hex')
          session.b = b
          session.B = srp.getB(session.v, session.g, b, session.N, alg)
          session.passwordStretching = account.passwordStretching
          return session
        }
      )
  }

  SrpSession.prototype.finish = function (A, M1) {
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

  SrpSession.client2 = function (session, email, password) {
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

  return SrpSession
}
