/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const Client = require('../client')()
var TestServer = require('../test_server')

var config = require('../../config').getProperties()

describe('remote recovery email resend code', function() {
  this.timeout(15000)
  let server
  before(() => {
    config.securityHistory.ipProfiling.allowedRecency = 0

    return TestServer.start(config)
      .then(s => {
        server = s
      })
  })

  it(
    'sign-in verification resend email verify code',
    () => {
      var email = server.uniqueEmail()
      var password = 'something'
      var verifyEmailCode = ''
      var client = null
      var options = {
        redirectTo: 'https://sync.'  + config.smtp.redirectDomain,
        service: 'sync',
        resume: 'resumeToken',
        keys: true
      }
      return Client.create(config.publicUrl, email, password, server.mailbox, options)
        .then(
          function (c) {
            client = c
            return Client.login(config.publicUrl, email, password, server.mailbox, options)
          }
        )
        .then(
          function () {
            return server.mailbox.waitForCode(email)
          }
        )
        .then(
          function (code) {
            verifyEmailCode = code
            return client.requestVerifyEmail()
          }
        )
        .then(
          function () {
            return server.mailbox.waitForCode(email)
          }
        )
        .then(
          function (code) {
            assert.equal(code, verifyEmailCode, 'code equal to verify email code')
            return client.verifyEmail(code)
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
            assert.equal(status.emailVerified, true, 'account email is verified')
            assert.equal(status.sessionVerified, true, 'account session is verified')
          }
        )
    }
  )

  it(
    'sign-in verification resend login verify code',
    () => {
      var email = server.uniqueEmail()
      var password = 'something'
      var verifyEmailCode = ''
      var client2 = null
      var options = {
        redirectTo: 'https://sync.'  + config.smtp.redirectDomain,
        service: 'sync',
        resume: 'resumeToken',
        keys: true
      }
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox, options)
        .then(
          function () {
            // Attempt to login from new location
            return Client.login(config.publicUrl, email, password, server.mailbox, options)
          }
        )
        .then(
          function (c) {
            client2 = c
          }
        )
        .then(
          function () {
            return client2.login(options)
          }
        )
        .then(
          function () {
            return server.mailbox.waitForCode(email)
          }
        )
        .then(
          function (code) {
            verifyEmailCode = code
            return client2.requestVerifyEmail()
          }
        )
        .then(
          function () {
            return server.mailbox.waitForCode(email)
          }
        )
        .then(
          function (code) {
            assert.equal(code, verifyEmailCode, 'code equal to verify email code')
            return client2.verifyEmail(code)
          }
        )
        .then(
          function () {
            return client2.emailStatus()
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, true, 'account is verified')
            assert.equal(status.emailVerified, true, 'account email is verified')
            assert.equal(status.sessionVerified, true, 'account session is verified')
          }
        )
    }
  )

  after(() => {
    return TestServer.stop(server)
  })
})
