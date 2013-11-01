/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('tap').test
var srp = require('srp')
var log = { trace: function() {} }

var Token = require('../../tokens')(log)
var DB = require('../../db/heap')(
  log,
  Token.error,
  Token.AuthToken,
  Token.SessionToken,
  Token.KeyFetchToken,
  Token.AccountResetToken,
  Token.SrpToken,
  Token.ForgotPasswordToken
)
var db = new DB()

var SrpToken = Token.SrpToken

var alice = {
  uid: 'xxx',
  email: Buffer('somebödy@example.com').toString('hex'),
  password: 'awesomeSauce',
  srp: {
    verifier: null,
    salt: 'BAD1'
  },
  kA: 'BAD3',
  wrapKb: 'BAD4'
}

alice.srp.verifier = srp.computeVerifier(
  srp.params[2048],
  Buffer(alice.srp.salt, 'hex'),
  Buffer(alice.email),
  Buffer(alice.password)
).toString('hex')

db.createAccount(alice)
.done(
  function (a) {

    test(
      'create login session works',
      function (t) {
        SrpToken.create(a)
          .done(
            function (s) {
              t.equal(s.uid, a.uid)
              t.equal(s.s, a.srp.salt)
              t.end()
            }
          )
      }
    )

    test(
      'finish login session works',
      function (t) {
        var session = null
        var K = null
        SrpToken.create(a)
          .then(
            function (s) {
              session = s
              return SrpToken.client2(s.clientData(), alice.email, alice.password)
            }
          )
          .then(
            function (x) {
              K = x.K
              return session.finish(x.A, x.M)
            }
          )
          .done(
            function (s) {
              t.equal(s.K.toString('hex'), K)
              t.end()
            }
          )
      }
    )
  }
)
