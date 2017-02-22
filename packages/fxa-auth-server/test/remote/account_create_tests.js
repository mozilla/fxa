/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var TestServer = require('../test_server')
var crypto = require('crypto')
const Client = require('../client')()
var config = require('../../config').getProperties()
const mocks = require('../mocks')

describe('remote account create', function() {
  this.timeout(15000)
  let server
  before(() => {
    // XXX: update this later to avoid issues.
    process.env.NODE_ENV = 'dev'
    return TestServer.start(config)
      .then(s => {
        server = s
      })
  })

  it(
    'unverified account fail when getting keys',
    () => {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null
      return Client.create(config.publicUrl, email, password)
        .then(
          function (x) {
            client = x
            assert.ok(client.authAt, 'authAt was set')
          }
        )
        .then(
          function () {
            return client.keys()
          }
        )
        .then(
          function (keys) {
            assert(false, 'got keys before verifying email')
          },
          function (err) {
            assert.equal(err.errno, 104, 'Unverified account error code')
            assert.equal(err.message, 'Unverified account', 'Unverified account error message')
          }
        )
    }
  )

  it(
    'create and verify sync account',
    () => {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null
      return Client.create(config.publicUrl, email, password, {service: 'sync'})
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
            assert.equal(status.verified, false)
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email)
          }
        )
        .then(
          function (emailData) {
            assert.equal(emailData.headers['x-template-name'], 'verifySyncEmail')
            assert.equal(emailData.html.indexOf('IP address') > -1, true) // Ensure some location data is present
            return emailData.headers['x-verify-code']
          }
        )
        .then(
          function (verifyCode) {
            return client.verifyEmail(verifyCode, { service: 'sync' })
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email)
          }
        )
        .then(
          function (emailData) {
            assert.equal(
              emailData.headers['x-link'].indexOf(config.smtp.syncUrl),
              0,
              'sync url present')
          }
        )
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, true)
          }
        )
    }
  )


  it(
    'create account with service identifier and resume',
    () => {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null // eslint-disable-line no-unused-vars
      var options = { service: 'abcdef', resume: 'foo' }
      return Client.create(config.publicUrl, email, password, options)
        .then(
          function (x) {
            client = x
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email)
          }
        )
        .then(
          function (emailData) {
            assert.equal(emailData.headers['x-service-id'], 'abcdef')
            assert.ok(emailData.headers['x-link'].indexOf('resume=foo') > -1)
          }
        )
    }
  )

  it(
    'create account allows localization of emails',
    () => {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null
      return Client.create(config.publicUrl, email, password)
        .then(
          function (x) {
            client = x
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email)
          }
        )
        .then(
          function (emailData) {
            assert(emailData.text.indexOf('Activate now') !== -1, 'not en-US')
            assert(emailData.text.indexOf('Ativar agora') === -1, 'not pt-BR')
            return client.destroyAccount()
          }
        )
        .then(
          function () {
            return Client.create(config.publicUrl, email, password, { lang: 'pt-br' })
          }
        )
        .then(
          function (x) {
            client = x
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email)
          }
        )
        .then(
          function (emailData) {
            assert(emailData.text.indexOf('Activate now') === -1, 'not en-US')
            assert(emailData.text.indexOf('Ativar agora') !== -1, 'is pt-BR')
            return client.destroyAccount()
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
      return client.auth()
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
    '/account/create works with proper data',
    () => {
      var email = server.uniqueEmail()
      var password = 'ilikepancakes'
      var client
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (x) {
            client = x
            assert.ok(client.uid, 'account created')
          }
        ).then(
          function () {
            return client.login()
          }
        ).then(
          function () {
            assert.ok(client.sessionToken, 'client can login')
          }
        )
    }
  )

  it(
    '/account/create returns a sessionToken',
    () => {
      var email = server.uniqueEmail()
      var password = 'ilikepancakes'
      var client = new Client(config.publicUrl)
      return client.setupCredentials(email, password)
        .then(
          function (c) {
            return c.api.accountCreate(c.email, c.authPW)
              .then(
                function (response) {
                  assert.ok(response.sessionToken, 'has a sessionToken')
                  assert.equal(response.keyFetchToken, undefined, 'no keyFetchToken without keys=true')
                }
              )
          }
        )
    }
  )

  it(
    '/account/create returns a keyFetchToken when keys=true',
    () => {
      var email = server.uniqueEmail()
      var password = 'ilikepancakes'
      var client = new Client(config.publicUrl)
      return client.setupCredentials(email, password)
        .then(
          function (c) {
            return c.api.accountCreate(c.email, c.authPW, { keys: true })
              .then(
                function (response) {
                  assert.ok(response.sessionToken, 'has a sessionToken')
                  assert.ok(response.keyFetchToken, 'keyFetchToken with keys=true')
                }
              )
          }
        )
    }
  )

  it(
    'signup with same email, different case',
    () => {
      var email = server.uniqueEmail()
      var email2 = email.toUpperCase()
      var password = 'abcdef'
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (c) {
            return Client.create(config.publicUrl, email2, password)
          }
        )
        .then(
          assert.fail,
          function (err) {
            assert.equal(err.code, 400)
            assert.equal(err.errno, 101, 'Account already exists')
            assert.equal(err.email, email, 'The existing email address is returned')
          }
        )
    }
  )

  it(
    're-signup against an unverified email',
    () => {
      var email = server.uniqueEmail()
      var password = 'abcdef'
      return Client.create(config.publicUrl, email, password)
        .then(
          function () {
            // delete the first verification email
            return server.mailbox.waitForEmail(email)
          }
        )
        .then(
          function () {
            return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
          }
        )
        .then(
          function (client) {
            assert.ok(client.uid, 'account created')
          }
        )
    }
  )

  it(
    'invalid redirectTo',
    () => {
      var api = new Client.Api(config.publicUrl)
      var email = server.uniqueEmail()
      var authPW = '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'
      var options = {
        redirectTo: 'http://accounts.firefox.com.evil.us'
      }
      return api.accountCreate(email, authPW, options)
      .then(
        assert.fail,
        function (err) {
          assert.equal(err.errno, 107, 'bad redirectTo rejected')
        }
      )
      .then(
        function () {
          return api.passwordForgotSendCode(email, options)
        }
      )
      .then(
        assert.fail,
        function (err) {
          assert.equal(err.errno, 107, 'bad redirectTo rejected')
        }
      )
    }
  )

  it(
    'another invalid redirectTo',
    () => {
      var api = new Client.Api(config.publicUrl)
      var email = server.uniqueEmail()
      var authPW = '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'
      var options = {
        redirectTo: 'https://www.fake.com/.firefox.com'
      }

      return api.accountCreate(email, authPW, options)
      .then(
        assert.fail,
        function (err) {
          assert.equal(err.errno, 107, 'bad redirectTo rejected')
        }
      )
      .then(
        function () {
          return api.passwordForgotSendCode(email, {
            redirectTo: 'https://fakefirefox.com'
          })
        }
      )
      .then(
        assert.fail,
        function (err) {
          assert.equal(err.errno, 107, 'bad redirectTo rejected')
        }
      )
    }
  )

  it(
    'create account with service query parameter',
    () => {
      var email = server.uniqueEmail()
      return Client.create(config.publicUrl, email, 'foo', { serviceQuery: 'bar' })
        .then(function () {
          return server.mailbox.waitForEmail(email)
        })
        .then(function (emailData) {
          assert.equal(emailData.headers['x-service-id'], 'bar', 'service query parameter was propagated')
        })
    }
  )

  it(
    'account creation works with unicode email address',
    () => {
      var email = server.uniqueUnicodeEmail()
      return Client.create(config.publicUrl, email, 'foo')
        .then(function (client) {
          assert.ok(client, 'created account')
          return server.mailbox.waitForEmail(email)
        })
        .then(function (emailData) {
          assert.ok(emailData, 'received email')
        })
    }
  )

  it(
    'account creation fails with invalid metricsContext flowId',
    () => {
      var email = server.uniqueEmail()
      return Client.create(config.publicUrl, email, 'foo', {
        metricsContext: {
          flowId: 'deadbeefbaadf00ddeadbeefbaadf00d',
          flowBeginTime: 1
        }
      }).then(function () {
        assert(false, 'account creation should have failed')
      }, function (err) {
        assert.ok(err, 'account creation failed')
      })
    }
  )

  it(
    'account creation fails with invalid metricsContext flowBeginTime',
    () => {
      var email = server.uniqueEmail()
      return Client.create(config.publicUrl, email, 'foo', {
        metricsContext: {
          flowId: 'deadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00d',
          flowBeginTime: 0
        }
      }).then(function () {
        assert(false, 'account creation should have failed')
      }, function (err) {
        assert.ok(err, 'account creation failed')
      })
    }
  )

  it(
    'account creation works with maximal metricsContext metadata',
    () => {
      var email = server.uniqueEmail()
      var opts = {
        metricsContext: mocks.generateMetricsContext()
      }
      return Client.create(config.publicUrl, email, 'foo', opts).then(function (client) {
        assert.ok(client, 'created account')
        return server.mailbox.waitForEmail(email)
      })
      .then(function (emailData) {
        assert.equal(emailData.headers['x-flow-begin-time'], opts.metricsContext.flowBeginTime, 'flow begin time set')
        assert.equal(emailData.headers['x-flow-id'], opts.metricsContext.flowId, 'flow id set')
      })
    }
  )

  it(
    'account creation works with empty metricsContext metadata',
    () => {
      var email = server.uniqueEmail()
      return Client.create(config.publicUrl, email, 'foo', {
        metricsContext: {}
      }).then(function (client) {
        assert.ok(client, 'created account')
      })
    }
  )

  it(
    'account creation fails with missing flowBeginTime',
    () => {
      var email = server.uniqueEmail()
      return Client.create(config.publicUrl, email, 'foo', {
        metricsContext: {
          flowId: 'deadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00d'
        }
      }).then(function () {
        assert(false, 'account creation should have failed')
      }, function (err) {
        assert.ok(err, 'account creation failed')
      })
    }
  )

  it(
    'account creation fails with missing flowId',
    () => {
      var email = server.uniqueEmail()
      return Client.create(config.publicUrl, email, 'foo', {
        metricsContext: {
          flowBeginTime: Date.now()
        }
      }).then(function () {
        assert(false, 'account creation should have failed')
      }, function (err) {
        assert.ok(err, 'account creation failed')
      })
    }
  )

  it(
    'create account for non-sync service, gets generic sign-up email and does not get post-verify email',
    () => {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null
      return Client.create(config.publicUrl, email, password)
        .then(
          function (x) {
            client = x
            assert.ok('account was created')
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email)
          }
        )
        .then(
          function (emailData) {
            assert.equal(emailData.headers['x-template-name'], 'verifyEmail')
            return emailData.headers['x-verify-code']
          }
        )
        .then(
          function (verifyCode) {
            return client.verifyEmail(verifyCode, { service: 'testpilot' })
          }
        )
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, true)
          }
        )
        .then(
          function () {
            // It's hard to test for "an email didn't arrive.
            // Instead trigger sending of another email and test
            // that there wasn't anything in the queue before it.
            return client.forgotPassword()
          }
        )
        .then(
          function () {
            return server.mailbox.waitForCode(email)
          }
        )
        .then(
          function (code) {
            assert.ok(code, 'the next email was reset-password, not post-verify')
          }
        )
    }
  )

  it(
    'create account for unspecified service does not get create sync email and no post-verify email',
    () => {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null
      return Client.create(config.publicUrl, email, password)
        .then(
          function (x) {
            client = x
            assert.ok('account was created')
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email)
          }
        )
        .then(
          function (emailData) {
            assert.equal(emailData.headers['x-template-name'], 'verifyEmail')
            assert.equal(emailData.html.indexOf('IP address') === -1, true) // Does not contain location data
            return emailData.headers['x-verify-code']
          }
        )
        .then(
          function (verifyCode) {
            return client.verifyEmail(verifyCode, { }) // no 'service' param
          }
        )
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            assert.equal(status.verified, true)
          }
        )
        .then(
          function () {
            // It's hard to test for "an email didn't arrive.
            // Instead trigger sending of another email and test
            // that there wasn't anything in the queue before it.
            return client.forgotPassword()
          }
        )
        .then(
          function () {
            return server.mailbox.waitForCode(email)
          }
        )
        .then(
          function (code) {
            assert.ok(code, 'the next email was reset-password, not post-verify')
          }
        )
    }
  )

  after(() => {
    return TestServer.stop(server)
  })
})
