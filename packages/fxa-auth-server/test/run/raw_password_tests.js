/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var crypto = require('crypto')
var Client = require('../../client')
var config = require('../../config').root()
var TestServer = require('../test_server')

function uniqueID() {
  return crypto.randomBytes(10).toString('hex');
}

TestServer.start(config.publicUrl)
.then(function main(server) {

  // Randomly-generated account names for testing.
  // This makes it easy to run the tests against an existing server
  // which may already have some accounts in its db.

  var email1 = uniqueID() + "@example.com"

  test(
    '(reduced security) Create account',
    function (t) {
      var clientApi = new Client.Api(config.publicUrl)
      var email = Buffer(email1).toString('hex')
      var password = 'allyourbasearebelongtous'
      return clientApi.rawPasswordAccountCreate(email, password, {preVerified: true})
        .then(
          function (result) {
            var client = null
            t.equal(typeof(result.uid), 'string')
            return Client.login(config.publicUrl, email1, password)
              .then(
                function (x) {
                  client = x
                  return client.keys()
                }
              )
              .then(
                function (keys) {
                  t.ok(Buffer.isBuffer(keys.kA), 'kA exists')
                  t.ok(Buffer.isBuffer(keys.wrapKb), 'wrapKb exists')
                  t.ok(Buffer.isBuffer(keys.kB), 'kB exists')
                  t.equal(client.kB.length, 32, 'kB exists, has the right length')
                }
              )
          }
        )
    }
  )

  test(
    '(reduced security) Login with email and password',
    function (t) {
      var clientApi = new Client.Api(config.publicUrl)
      var email =  Buffer(email1).toString('hex')
      var password = 'allyourbasearebelongtous'
      return clientApi.rawPasswordSessionCreate(email, password)
        .then(
          function (result) {
            t.ok(result.uid, 'uid exists')
            t.equal(result.verified, true, 'email verified')
            t.equal(typeof(result.sessionToken), 'string', 'sessionToken exists')
          }
        )
    }
  )

  test(
    '(reduced security) Login with email and wrong password',
    function (t) {
      var clientApi = new Client.Api(config.publicUrl)
      var email =  Buffer(email1).toString('hex')
      var password = 'xxx'
      return clientApi.rawPasswordSessionCreate(email, password)
        .then(
          function (result) {
            t.fail('login succeeded')
          },
          function (err) {
            t.equal(err.errno, 103)
          }
        )
    }
  )

  test(
    '(reduced security) Login with unknown email',
    function (t) {
      var clientApi = new Client.Api(config.publicUrl)
      var email =  Buffer('x@y.me').toString('hex')
      var password = 'allyourbasearebelongtous'
      return clientApi.rawPasswordSessionCreate(email, password)
        .then(
          function (result) {
            t.fail('login succeeded')
          },
          function (err) {
            t.equal(err.errno, 102)
          }
        )
    }
  )

  test(
    '(reduced security) Change password',
    function (t) {
      var clientApi = new Client.Api(config.publicUrl)
      var email =  Buffer(email1).toString('hex')
      var password = 'allyourbasearebelongtous'
      var newPassword = 'wow'
      return clientApi.rawPasswordPasswordChange(email, password, newPassword)
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
