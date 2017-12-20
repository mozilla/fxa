/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('assert')
const Client = require('../client')()
var crypto = require('crypto')
var TestServer = require('../test_server')

var config = require('../../config').getProperties()

describe('remote account login', () => {
  let server

  before(function() {
    this.timeout(15000)
    config.securityHistory.ipProfiling.allowedRecency = 0
    config.signinConfirmation.skipForNewAccounts.enabled = false
    return TestServer.start(config)
      .then(s => {
        server = s
      })
  })

  it(
    'the email is returned in the error on Incorrect password errors',
    () => {
      var email = server.uniqueEmail()
      var password = 'abcdef'
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function () {
            return Client.login(config.publicUrl, email, password + 'x')
          }
        )
        .then(
          () => assert(false),
          function (err) {
            assert.equal(err.code, 400)
            assert.equal(err.errno, 103)
            assert.equal(err.email, email)
          }
        )
    }
  )

  it(
    'the email is returned in the error on Incorrect email case errors with correct password',
    () => {
      var signupEmail = server.uniqueEmail()
      var loginEmail = signupEmail.toUpperCase()
      var password = 'abcdef'
      return Client.createAndVerify(config.publicUrl, signupEmail, password, server.mailbox)
        .then(
          function () {
            return Client.login(config.publicUrl, loginEmail, password)
          }
        )
        .then(
          () => assert(false),
          function (err) {
            assert.equal(err.code, 400)
            assert.equal(err.errno, 120)
            assert.equal(err.email, signupEmail)
          }
        )
    }
  )

  it(
    'Unknown account should not exist',
    () => {
      var client = new Client(config.publicUrl)
      client.email = server.uniqueEmail()
      client.authPW = crypto.randomBytes(32)
      return client.login()
        .then(
          function () {
            assert(false, 'account should not exist')
          },
          function (err) {
            assert.equal(err.errno, 102, 'account does not exist')
          }
        )
    }
  )

  it(
    'No keyFetchToken without keys=true',
    () => {
      var email = server.uniqueEmail()
      var password = 'abcdef'
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (c) {
            return Client.login(config.publicUrl, email, password, { keys: false })
          }
        )
        .then(
          function (c) {
            assert.equal(c.keyFetchToken, null, 'should not have keyFetchToken')
          }
        )
    }
  )

  it(
    'login works with unicode email address',
    () => {
      var email = server.uniqueUnicodeEmail()
      var password = 'wibble'
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function () {
            return Client.login(config.publicUrl, email, password)
          }
        )
        .then(
          function (client) {
            assert.ok(client, 'logged in to account')
          }
        )
    }
  )

  it(
    'account login works with minimal metricsContext metadata',
    () => {
      var email = server.uniqueEmail()
      return Client.createAndVerify(config.publicUrl, email, 'foo', server.mailbox)
        .then(function () {
          return Client.login(config.publicUrl, email, 'foo', {
            metricsContext: {
              flowId: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
              flowBeginTime: Date.now()
            }
          })
        })
        .then(function (client) {
          assert.ok(client, 'logged in to account')
        })
    }
  )

  it(
    'account login fails with invalid metricsContext flowId',
    () => {
      var email = server.uniqueEmail()
      return Client.createAndVerify(config.publicUrl, email, 'foo', server.mailbox)
        .then(function () {
          return Client.login(config.publicUrl, email, 'foo', {
            metricsContext: {
              flowId: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
              flowBeginTime: Date.now()
            }
          })
        })
        .then(function () {
          assert(false, 'account login should have failed')
        }, function (err) {
          assert.ok(err, 'account login failed')
        })
    }
  )

  it(
    'account login fails with invalid metricsContext flowBeginTime',
    () => {
      var email = server.uniqueEmail()
      return Client.createAndVerify(config.publicUrl, email, 'foo', server.mailbox)
        .then(function () {
          return Client.login(config.publicUrl, email, 'foo', {
            metricsContext: {
              flowId: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
              flowBeginTime: 'wibble'
            }
          })
        })
        .then(function () {
          assert(false, 'account login should have failed')
        }, function (err) {
          assert.ok(err, 'account login failed')
        })
    }
  )

  describe('can force verificationMethod', () => {
    let client, email
    const password = 'foo'
    before(() => {
      email = server.uniqueEmail()
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
    })

    it('fails with invalid verification method', () => {
      return Client.login(config.publicUrl, email, password, {
        verificationMethod: 'notvalid'
      })
        .then(() => {
          assert.fail('should not have succeed')
        }, (err) => {
          assert.equal(err.errno, 107, 'invalid parameter')
        })
    })

    it('can force `email` verification', () => {
      return Client.login(config.publicUrl, email, password, {
        verificationMethod: 'email'
      })
        .then((res) => {
          client = res
          assert.equal(res.verificationMethod, 'email', 'sets correct verification method')
          return client.emailStatus()
        })
        .then((status) => {
          assert.equal(status.verified, false, 'account is not verified')
          assert.equal(status.emailVerified, true, 'email is verified')
          assert.equal(status.sessionVerified, false, 'session is not verified')
          return server.mailbox.waitForEmail(email)
        })
        .then((emailData) => {
          assert.equal(emailData.headers['x-template-name'], 'verifyLoginEmail', 'confirm sign-in link sent')
          const code = emailData.headers['x-verify-code']
          assert.ok(code, 'code is sent')
          return client.verifyEmail(code)
        })
        .then((res) => {
          assert.ok(res, 'verified successful response')
          return client.emailStatus()
        })
        .then((status) => {
          assert.equal(status.verified, true, 'account is verified')
          assert.equal(status.emailVerified, true, 'email is verified')
          assert.equal(status.sessionVerified, true, 'session is verified')
        })
    })

    it('can force `email-2fa` verification', () => {
      return Client.login(config.publicUrl, email, password, {
        verificationMethod: 'email-2fa'
      })
        .then((res) => {
          client = res
          assert.equal(res.verificationMethod, 'email-2fa', 'sets correct verification method')
          return client.emailStatus()
        })
        .then((status) => {
          assert.equal(status.verified, false, 'account is not verified')
          assert.equal(status.emailVerified, true, 'email is verified')
          assert.equal(status.sessionVerified, false, 'session is not verified')
          return server.mailbox.waitForEmail(email)
        })
        .then((emailData) => {
          assert.equal(emailData.headers['x-template-name'], 'verifyLoginCodeEmail', 'sign-in code sent')
          const code = emailData.headers['x-signin-verify-code']
          assert.ok(code, 'code is sent')
        })
    })
  })

  after(() => {
    return TestServer.stop(server)
  })
})
