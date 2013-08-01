/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (P, uuid, srp, bigint, db, error) {

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
    this.type = null // 'login' | 'passwordChange'
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

  SrpSession.create = function (type, account) {
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
          session.s = account.salt
          session.v = bigint(account.verifier, 16)
          session.b = b
          session.B = srp.getB(session.v, session.g, b, session.N, alg)
          session.type = type
          return session.save()
        }
      )
  }

  SrpSession.del = function (id) {
    return db.delete(id + '/srp')
  }

  SrpSession.start = function (type, account) {
    return SrpSession.create(type, account)
      .then(
        function (session) {
          return session.clientData()
        }
      )
  }

  SrpSession.finish = function (id, A, M1) {
    A = bigint(A, 16)
    return SrpSession
      .get(id)
      .then(
        function (session) {
          var N = srp.params[2048].N
          var S = srp.server_getS(
            Buffer(session.s, 'hex'),
            bigint(session.v, 16),
            N,
            srp.params[2048].g,
            A,
            bigint(session.b, 16),
            alg
          )
          var M2 = srp.getM(A, bigint(session.B, 16), S, N)
          if (M1 !== M2.toBuffer().toString('hex')) {
            // TODO: increment bad guess counter
            // TODO: delete session?
            throw error.incorrectPassword()
          }
          session.K = srp.getK(S, N, alg).toBuffer()
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
    s.v = bigint(object.v, 16)
    s.b = bigint(object.b, 16)
    s.B = bigint(object.B, 16)
    s.type = object.type
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
      stretch: {
        salt: 'FEED'
      },
      srp: {
        N_bits: 2048,
        alg: 'sha256',
        s: this.s,
        B: this.B.toBuffer().toString('hex')
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
          var B = bigint(session.srp.B, 16)
          var S = srp.client_getS(
            Buffer(session.srp.s, 'hex'),
            Buffer(email),
            Buffer(password),
            N,
            g,
            a,
            B,
            session.srp.alg
          )

          var M = srp.getM(A, B, S, N)
          var K = srp.getK(S, N, session.srp.alg)
          return {
            A: A.toBuffer().toString('hex'),
            M: M.toBuffer().toString('hex'),
            K: K.toBuffer().toString('hex')
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
      v: this.v.toBuffer().toString('hex'),
      b: this.b.toBuffer().toString('hex'),
      B: this.B.toBuffer().toString('hex'),
      type: this.type
    }).then(function () { return self })
  }

  SrpSession.prototype.del = function () {
    return SrpSession.del(this.id)
  }

  return SrpSession
}
