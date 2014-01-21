/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var crypto = require('crypto')
var Client = require('../../client')
var config = require('../../config').root()

TestServer.start(config)
.then(function main(server) {

  test(
    'the rawEmail is returned in the error on Incorrect Password errors',
    function (t) {
      var signupEmail = server.uniqueEmail()
      var loginEmail = signupEmail.toUpperCase()
      var password = 'abcdef'
      return Client.createAndVerify(config.publicUrl, signupEmail, password, server.mailbox)
        .then(
          function (c) {
            return Client.login(config.publicUrl, loginEmail, password)
          }
        )
        .then(
          t.fail,
          function (err) {
            t.equal(err.code, 400)
            t.equal(err.errno, 103)
            t.equal(err.email, signupEmail)
          }
        )
    }
  )

  test(
    'Unknown account should not exist',
    function (t) {
      var client = new Client(config.publicUrl)
      client.email = server.uniqueEmail()
      client.authPW = crypto.randomBytes(32)
      return client.login()
        .then(
          function () {
            t.fail('account should not exist')
          },
          function (err) {
            t.equal(err.errno, 102, 'account does not exist')
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
