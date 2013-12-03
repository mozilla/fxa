/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var crypto = require('crypto')
var config = require('../../config').root()
var Client = require('../../client')

function fail() { throw new Error() }

TestServer.start(config.public_url)
.then(function main(server) {

  test(
    '/certificate/sign inputs',
    function (t) {
      var email = crypto.randomBytes(10).toString('hex') + '@example.com'
      var password = '123456'
      var client = null
      return Client.create('http://127.0.0.1:9000', email, password, {preVerified: true})
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
    'teardown',
    function (t) {
      server.stop()
      t.end()
    }
  )
})
