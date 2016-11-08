/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var TestServer = require('../test_server')
const Client = require('../client')()

describe('remote account signin verification enable', function() {
  this.timeout(30000)
  it(
    'signin confirmation can be disabled',
    () => {
      process.env.SIGNIN_CONFIRMATION_ENABLED = false
      var config = require('../../config').getProperties()
      var server, email, client
      var password = 'allyourbasearebelongtous'

      return TestServer.start(config)
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
            assert.ok(client.authAt, 'authAt was set')
          }
        )
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, true, 'account is verified')
          }
        )
        .then(
          function () {
            return client.login({keys:true})
          }
        )
        .then(
          function (response) {
            assert.notEqual(response.verificationMethod, 'email', 'verification method not set')
            assert.notEqual(response.verificationReason, 'login', 'verification reason not set')
          }
        )
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, true, 'account is verified')
          }
        )
        .then(function() {
          return TestServer.stop(server)
        })
    }
  )

  it(
    'signin confirmation can be enabled',
    () => {
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
            assert.ok(client.authAt, 'authAt was set')
          }
        )
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, true, 'account is verified')
          }
        )
        .then(
          function () {
            return client.login({keys:true})
          }
        )
        .then(
          function (response) {
            assert.equal(response.verificationMethod, 'email', 'verification method set')
            assert.equal(response.verificationReason, 'login', 'verification reason set')
          }
        )
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, false, 'account is not verified')
            assert.equal(status.emailVerified, true, 'email is verified')
            assert.equal(status.sessionVerified, false, 'session is not verified')
          }
        )
        .then(function() {
          return TestServer.stop(server)
        })
    }
  )

  after(() => {
    delete process.env.SIGNIN_CONFIRMATION_ENABLED
    TestServer.stop()
  })
})
