/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('tap').test
var crypto = require('crypto')
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
          .then(
            function (s) {
              t.equal(s.uid, a.uid)
              t.equal(s.s, a.srp.salt)
            }
          )
          .done(
            function () {
              t.end()
            },
            function (err) {
              t.fail(err)
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
              var a = crypto.randomBytes(32)
              var clientData = s.clientData()
              var srpClient = new srp.Client(
                srp.params[2048],
                Buffer(clientData.srp.salt, 'hex'),
                Buffer(alice.email),
                Buffer(alice.password),
                a
              )
              srpClient.setB(Buffer(clientData.srp.B, 'hex'))
              return {
                A: srpClient.computeA().toString('hex'),
                M: srpClient.computeM1().toString('hex'),
                K: srpClient.computeK().toString('hex'),
              }
            }
          )
          .then(
            function (x) {
              K = x.K
              return session.finish(x.A, x.M)
            }
          )
          .then(
            function (s) {
              t.equal(s.K.toString('hex'), K)
            }
          )
          .done(
            function () {
              t.end()
            },
            function (err) {
              t.fail(err)
              t.end()
            }
          )
      }
    )
  }
)
