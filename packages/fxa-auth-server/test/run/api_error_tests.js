/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var crypto = require('crypto')
var config = require('../../config').root()
var Client = require('../../client')

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
/*/
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
/*/
  test(
    'signup with same email, different case',
    function (t) {
      var email = 'TEST@EXAMPLE.COM'
      var email2 = 'test@example.com'
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
      var signupEmail = 'TestX@example.com'
      var loginEmail = 'testx@example.com'
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
    'teardown',
    function (t) {
      server.stop()
      t.end()
    }
  )
})
