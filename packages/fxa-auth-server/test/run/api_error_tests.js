/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var crypto = require('crypto')
var path = require('path')
var Client = require('../../client')
var request = require('request')

process.env.CONFIG_FILES = path.join(__dirname, '../config/api_error.json')
var config = require('../../config').root()

function fail() { throw new Error() }

TestServer.start(config.publicUrl)
.then(function main(server) {

  test(
    '/certificate/sign inputs',
    function (t) {
      var email = crypto.randomBytes(10).toString('hex') + '@example.com'
      var password = '123456'
      var client = null
      return Client.create(config.publicUrl, email, password, {preVerified: true})
        .then(
          function (c) {
            client = c
            // string as publicKey
            return client.sign("tada", 1000)
          }
        )
        .then(
          fail,
          function (err) {
            t.equal(err.code, 400, 'string as publicKey')
            // empty object as publicKey
            return client.sign({}, 1000)
          }
        )
        .then(
          fail,
          function (err) {
            t.equal(err.code, 400, 'empty object as publicKey')
            // invalid publicKey argument
            return client.sign({ algorithm: 'RS', n: 'x', e: 'y', invalid: true }, 1000)
          }
        )
        .then(
          fail,
          function (err) {
            t.equal(err.code, 400, 'invalid publicKey argument')
            // undefined duration
            return client.sign({ algorithm: 'RS', n: 'x', e: 'y' }, undefined)
          }
        )
        .then(
          fail,
          function (err) {
            t.equal(err.code, 400, 'undefined duration')
            // missing publicKey arguments (e)
            return client.sign({ algorithm: 'RS', n: 'x' }, 1000)
          }
        )
        .then(
          fail,
          function (err) {
            t.equal(err.code, 400, 'missing publicKey arguments (e)')
            // invalid algorithm
            return client.sign({ algorithm: 'NSA' }, 1000)
          }
        )
        .then(
          fail,
          function (err) {
            t.equal(err.code, 400, 'invalid algorithm')
          }
        )
    }
  )

  test(
    '/account/create with malformed email address',
    function (t) {
      var email = 'notAnEmailAddress'
      var password = '123456'
      return Client.create('http://127.0.0.1:9000', email, password, {preVerified: true})
        .then(
          fail,
          function (err) {
            t.equal(err.code, 400, 'malformed email is rejected')
          }
        )
    }
  )

  test(
    'invalid redirectTo',
    function (t) {
      var api = new Client.Api(config.publicUrl)
      var email = crypto.randomBytes(10).toString('hex') + '@example.com'
      var options = {
        redirectTo: 'http://accounts.firefox.com.evil.us'
      }
      return api.accountCreate(email, '123456', options)
      .then(
        fail,
        function (err) {
          t.equal(err.code, 400, 'bad redirectTo rejected')
        }
      )
      .then(
        function () {
          return api.passwordForgotSendCode(email, options)
        }
      )
      .then(
        fail,
        function (err) {
          t.equal(err.code, 400, 'bad redirectTo rejected')
        }
      )
    }
  )

  test(
    'signup with same email, different case',
    function (t) {
      var email = Math.random() + 'TEST@EXAMPLE.COM'
      var email2 = email.toLowerCase()
      var password = 'abcdef'
      return Client.create(config.publicUrl, email, password, { preVerified: true })
        .then(
          function (c) {
            return Client.create(config.publicUrl, email2, password, { preVerified: true })
          }
        )
        .then(
          fail,
          function (err) {
            t.equal(err.code, 400)
            t.equal(err.errno, 101, 'Account already exists')
          }
        )
    }
  )

  test(
    'the rawEmail is returned in the error on Incorrect Password errors',
    function (t) {
      var signupEmail = Math.random() + 'Test@example.com'
      var loginEmail = signupEmail.toLowerCase()
      var password = 'abcdef'
      return Client.create(config.publicUrl, signupEmail, password, { preVerified: true})
        .then(
          function (c) {
            return Client.login(config.publicUrl, loginEmail, password)
          }
        )
        .then(
          fail,
          function (err) {
            t.equal(err.code, 400)
            t.equal(err.errno, 103)
            t.equal(err.email, signupEmail)
          }
        )
    }
  )

  test(
    'unsupported api version',
    function (t) {
      request(config.publicUrl + '/v0/account/create', function (err, res) {
        t.equal(res.statusCode, 410, 'http gone')
        t.end()
      })
    }
  )

  test(
    'token expiry',
    function (t) {
      // FYI config.tokenLifetimes.passwordChangeToken = -1
      var email = Math.random() + "@example.com"
      var password = 'ok'
      return Client.create(config.publicUrl, email, password, { preVerified: true })
        .then(
          function (c) {
            return c.changePassword('hello')
          }
        )
        .then(
          fail,
          function (err) {
            t.equal(err.errno, 110, 'invalid token')
          }
        )
    }
  )

  test(
    'invalid authPW on account destroy',
    function (t) {
      var email = Math.random() + "@example.com"
      var password = 'ok'
      return Client.create(config.publicUrl, email, password, { preVerified: true })
        .then(
          function (c) {
            c.authPW = Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex')
            return c.destroyAccount()
          }
        )
        .then(
          fail,
          function (err) {
            t.equal(err.errno, 103)
          }
        )
    }
  )

  test(
    'teardown',
    function (t) {
      server.stop()
      t.end()
    }
  )
})
