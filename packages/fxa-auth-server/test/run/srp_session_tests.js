/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
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
.then(
  function (a) {

    test(
      'create login session works',
      function (t) {
        return SrpToken.create(a)
          .then(
            function (s) {
              t.equal(s.uid, a.uid)
              t.equal(s.s, a.srp.salt)
            }
          )
      }
    )

    test(
      'finish login session works',
      function (t) {
        var session = null
        var K = null
        return SrpToken.create(a)
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
      }
    )
  }
)
.done(
  function () {

    test(
      'authToken encryption is test-vector compliant',
      function (t) {
        var srpK = 'e68fd0112bfa31dcffc8e9c96a1cbadb4c3145978ff35c73e5bf8d30bbc7499a'
        var authToken = Buffer('606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f', 'hex')
        var bundle = '253957f10e861c7c0a12bb0193d384d9579db544666d50bd3252d6576c768a68' +
                     'a98c87f5769ab4ccca3df863faeb217eb16ddc29d712b30112b446324ee806d6'
        return SrpToken.create(alice)
          .then(
            function (token) {
              token.K = Buffer(srpK, 'hex')
              return token.bundleAuth(authToken)
            }
          )
          .then(
            function (b) {
              t.equal(b, bundle)
            }
          )
      }
    )
  }
)
