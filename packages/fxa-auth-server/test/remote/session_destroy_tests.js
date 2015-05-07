/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var Client = require('../client')

var config = require('../../config').root()

TestServer.start(config)
.then(function main(server) {

  test(
    'session destroy',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'foobar'
      var client = null
      var sessionToken = null
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (x) {
            client = x
            return client.sessionStatus()
          }
        )
        .then(
          function () {
            sessionToken = client.sessionToken
            return client.destroySession()
          }
        )
        .then(
          function () {
            t.equal(client.sessionToken, null, 'session token deleted')
            client.sessionToken = sessionToken
            return client.sessionStatus()
          }
        )
        .then(
          function (status) {
            t.fail('got status with destroyed session')
          },
          function (err) {
            t.equal(err.errno, 110, 'session is invalid')
          }
        )
    }
  )

  test(
    'session status with valid token',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'testx'
      var uid = null
      return Client.create(config.publicUrl, email, password)
        .then(
          function (c) {
            uid = c.uid
            return c.login()
              .then(
                function () {
                  return c.api.sessionStatus(c.sessionToken)
                }
              )
          }
        )
        .then(
          function (x) {
            t.deepEqual(x, { uid: uid }, 'good status')
          }
        )
    }
  )

  test(
    'session status with invalid token',
    function (t) {
      var client = new Client(config.publicUrl)
      return client.api.sessionStatus('0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF')
        .then(
          t.fail,
          function (err) {
            t.equal(err.errno, 110, 'invalid token')
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
