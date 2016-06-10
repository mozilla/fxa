/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var Client = require('../client')

test(
  'signin confirmation can be disabled',
  function (t) {
    process.env.SIGNIN_CONFIRMATION_ENABLED = false
    var config = require('../../config').getProperties()
    var server, email, client
    var password = 'allyourbasearebelongtous'

    TestServer.start(config)
      .then(function main(serverObj) {
        server = serverObj
        email = server.uniqueEmail()
      })
      .then(function() {
        return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, {keys:true})
      })
      .then(
        function (x) {
          client = x
          t.ok(client.authAt, 'authAt was set')
        }
      )
      .then(
        function () {
          return client.emailStatus()
        }
      )
      .then(
        function (status) {
          t.equal(status.verified, true, 'account is verified')
        }
      )
      .then(
        function () {
          return client.login({keys:true})
        }
      )
      .then(
        function (response) {
          t.notEqual(response.verificationMethod, 'email', 'verification method not set')
          t.notEqual(response.verificationReason, 'login', 'verification reason not set')
        }
      )
      .then(
        function () {
          return client.emailStatus()
        }
      )
      .then(
        function (status) {
          t.equal(status.verified, true, 'account is verified')
        }
      )
      .done(function() {
        server.stop()
        t.end()
      })
  }
)

test(
  'signin confirmation can be enabled',
  function (t) {
    process.env.SIGNIN_CONFIRMATION_ENABLED = true
    process.env.SIGNIN_CONFIRMATION_RATE = 1.0
    var config = require('../../config').getProperties()
    var server, email, client
    var password = 'allyourbasearebelongtous'

    TestServer.start(config)
      .then(function main(serverObj) {
        server = serverObj
        email = server.uniqueEmail()
      })
      .then(function() {
        return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, {keys:true})
      })
      .then(
        function (x) {
          client = x
          t.ok(client.authAt, 'authAt was set')
        }
      )
      .then(
        function () {
          return client.emailStatus()
        }
      )
      .then(
        function (status) {
          t.equal(status.verified, true, 'account is verified')
        }
      )
      .then(
        function () {
          return client.login({keys:true})
        }
      )
      .then(
        function (response) {
          t.equal(response.verificationMethod, 'email', 'verification method set')
          t.equal(response.verificationReason, 'login', 'verification reason set')
        }
      )
      .then(
        function () {
          return client.emailStatus()
        }
      )
      .then(
        function (status) {
          t.equal(status.verified, false, 'account is not verified')
          t.equal(status.emailVerified, true, 'email is verified')
          t.equal(status.sessionVerified, false, 'session is not verified')
        }
      )
      .done(function() {
        server.stop()
        t.end()
      })
  }
)
