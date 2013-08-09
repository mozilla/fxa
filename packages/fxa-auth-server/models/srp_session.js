/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (P, uuid, srp, db, error) {

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
    srp.genKey(
      function (err, b) {
        return err ? d.reject(err) : d.resolve(b)
      }
    )
    return d.promise
  }

  SrpSession.create = function (account) {
    var session = null
    if (!account) { throw error.unknownAccount() }
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
          return session.save()
        }
      )
  }

  SrpSession.del = function (id) {
    return db.delete(id + '/srp')
  }

  SrpSession.start = function (account) {
    return SrpSession.create(account)
      .then(
        function (session) {
          return session.clientData()
        }
      )
  }

  SrpSession.finish = function (id, A, M1) {
    A = Buffer(A, 'hex')
    return SrpSession
      .get(id)
      .then(
        function (session) {
          var N = srp.params[2048].N
          var S = srp.server_getS(
            Buffer(session.s, 'hex'),
            Buffer(session.v, 'hex'),
            N,
            srp.params[2048].g,
            A,
            Buffer(session.b, 'hex'),
            alg
          )
          var M2 = srp.getM(A, Buffer(session.B, 'hex'), S, N)
          if (M1 !== M2.toString('hex')) {
            // TODO: increment bad guess counter
            // TODO: delete session?
            throw error.incorrectPassword()
          }
          session.K = srp.getK(S, N, alg)
          return session
            .del()
            .then(function () { return session })
        }
      )
  }

  SrpSession.hydrate = function (object) {
    if (!object) return null
    if (object.value) object = object.value
    var s = new SrpSession()
    s.id = object.id
    s.uid = object.uid
    s.N = srp.params[object.N_bits].N
    s.g = srp.params[object.N_bits].g
    s.s = object.s
    s.v = Buffer(object.v, 'hex')
    s.b = Buffer(object.b, 'hex')
    s.B = Buffer(object.B, 'hex')
    return s
  }

  SrpSession.get = function (id) {
    return db
      .get(id + '/srp')
      .then(SrpSession.hydrate)
  }

  SrpSession.prototype.clientData = function () {
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

  SrpSession.prototype.save = function () {
    var self = this
    return db.set(this.id + '/srp', {
      id: this.id,
      uid: this.uid,
      N_bits: 2048, // TODO
      s: this.s,
      v: this.v.toString('hex'),
      b: this.b.toString('hex'),
      B: this.B.toString('hex')
    }).then(function () { return self })
  }

  SrpSession.prototype.del = function () {
    return SrpSession.del(this.id)
  }

  return SrpSession
}
