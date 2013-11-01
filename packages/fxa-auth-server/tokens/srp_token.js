/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var crypto = require('crypto')

module.exports = function (log, P, uuid, srp, error) {

  function SrpToken() {
    this.id = null
    this.uid = null
    this.v = null
    this.s = null
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
          var srpServer = new srp.Server(
            srp.params[2048],
            Buffer(account.srp.verifier, 'hex'),
            b
          )
          t = new SrpToken()
          t.id = uuid.v4()
          t.uid = account.uid
          t.v = Buffer(account.srp.verifier, 'hex')
          t.b = b
          t.s = account.srp.salt
          t.B = srpServer.computeB()
          t.passwordStretching = account.passwordStretching
          return t
        }
      )
  }

  SrpToken.prototype.finish = function (A, M1) {
    A = Buffer(A, 'hex')
    var srpServer = new srp.Server(
      srp.params[2048],
      this.v,
      this.b
    )
    srpServer.setA(A)
    try {
      srpServer.checkM1(Buffer(M1, 'hex'))
    }
    catch (e) {
      throw error.incorrectPassword()
    }
    this.K = srpServer.computeK()
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
          var srpClient = new srp.Client(
            srp.params[2048],
            Buffer(session.srp.salt, 'hex'),
            Buffer(email),
            Buffer(password),
            a
          )
          srpClient.setB(Buffer(session.srp.B, 'hex'))

          var A = srpClient.computeA()
          var M = srpClient.computeM1()
          var K = srpClient.computeK()

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
