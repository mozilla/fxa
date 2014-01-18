/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var Client = require('../../client')
var TestServer = require('../test_server')
var config = require('../../config').root()

TestServer.start(config)
.then(function main(server) {

  test(
    'password change',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var newPassword = 'foobar'
      var kB = null
      var kA = null
      var client = null
      var firstAuthPW
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (x) {
            client = x
            firstAuthPW = x.authPW.toString('hex')
            return client.keys()
          }
        )
        .then(
          function (keys) {
            kB = keys.kB
            kA = keys.kA
          }
        )
        .then(
          function () {
            return client.changePassword(newPassword)
          }
        )
        .then(
          function () {
            t.notEqual(client.authPW.toString('hex'), firstAuthPW, 'password has changed')
            return client.keys()
          }
        )
        .then(
          function (keys) {
            t.deepEqual(keys.kB, kB, 'kB is preserved')
            t.deepEqual(keys.kA, kA, 'kA is preserved')
          }
        )
        .then(
          function () {
            return server.assertLogs(t, {
              'login-success': 2,
              'pwd-change-request': 1,
              'pwd-reset-success': 1,
              'auth-failure': 0
            })
          }
        )
    }
  )

  test(
    'wrong password on change start',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (x) {
            client = x
            return client.keys()
          }
        )
        .then(
          function () {
            client.authPW = Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex')
            return client.changePassword('foobar')
          }
        )
        .then(
          t.fail,
          function (err) {
            t.equal(err.errno, 103, 'invalid password')
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
