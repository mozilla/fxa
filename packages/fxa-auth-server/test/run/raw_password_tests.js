/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('tap').test
var crypto = require('crypto')
var Client = require('../../client')
var config = require('../../config').root()
var TestServer = require('../test_server')

process.env.DEV_VERIFIED = 'true'

function uniqueID() {
  return crypto.randomBytes(10).toString('hex');
}

TestServer.start(config.public_url)
.then(function main(server) {

  // Randomly-generated account names for testing.
  // This makes it easy to run the tests against an existing server
  // which may already have some accounts in its db.

  var email1 = uniqueID() + "@example.com"
  var email2 = uniqueID() + "@example.com"
  var email3 = uniqueID() + "@example.com"

  test(
    '(reduced security) Create account',
    function (t) {
      var clientApi = new Client.Api(config.public_url)
      var email = Buffer(email1).toString('hex')
      var password = 'allyourbasearebelongtous'
      clientApi.rawPasswordAccountCreate(email, password)
        .done(
          function (result) {
            var client = null
            t.equal(typeof(result.uid), 'string')
            Client.login(config.public_url, email1, password)
              .then(
                function (x) {
                  client = x
                  return client.keys()
                }
              )
              .then(
                function (keys) {
                  t.equal(typeof(keys.kA), 'string', 'kA exists')
                  t.equal(typeof(keys.wrapKb), 'string', 'wrapKb exists')
                  t.equal(client.kB.length, 64, 'kB exists, has the right length')
                  t.end()
                }
              )
          }
        )
    }
  )

  test(
    '(reduced security) Login with email and password',
    function (t) {
      var clientApi = new Client.Api(config.public_url)
      var email =  Buffer(email1).toString('hex')
      var password = 'allyourbasearebelongtous'
      clientApi.rawPasswordSessionCreate(email, password)
        .then(
          function (result) {
            t.ok(result.uid, 'uid exists')
            t.equal(result.verified, true, 'email verified')
            t.equal(typeof(result.sessionToken), 'string', 'sessionToken exists')
            t.end()
          }
        )
    }
  )

  test(
    '(reduced security) Login with email and wrong password',
    function (t) {
      var clientApi = new Client.Api(config.public_url)
      var email =  Buffer(email1).toString('hex')
      var password = 'xxx'
      clientApi.rawPasswordSessionCreate(email, password)
        .then(
          function (result) {
            t.fail('login succeeded')
            t.end()
          },
          function (err) {
            t.equal(err.errno, 103)
            t.end()
          }
        )
    }
  )

  test(
    '(reduced security) Login with unknown email',
    function (t) {
      var clientApi = new Client.Api(config.public_url)
      var email =  Buffer('x@y.me').toString('hex')
      var password = 'allyourbasearebelongtous'
      clientApi.rawPasswordSessionCreate(email, password)
        .done(
          function (result) {
            t.fail('login succeeded')
            t.end()
          },
          function (err) {
            t.equal(err.errno, 102)
            t.end()
          }
        )
    }
  )

  test(
    '(reduced security) Change password',
    function (t) {
      var clientApi = new Client.Api(config.public_url)
      var email =  Buffer(email1).toString('hex')
      var password = 'allyourbasearebelongtous'
      var newPassword = 'wow'
      clientApi.rawPasswordPasswordChange(email, password, newPassword)
        .then(
          function (result) {
            t.equal(JSON.stringify(result), '{}', 'password changed')
            return clientApi.rawPasswordSessionCreate(email, newPassword)
          }
        )
        .then(
          function (result) {
            t.ok(result.uid, 'uid exists')
            t.equal(result.verified, true, 'email verified')
            t.equal(typeof(result.sessionToken), 'string', 'sessionToken exists')
            t.end()
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
