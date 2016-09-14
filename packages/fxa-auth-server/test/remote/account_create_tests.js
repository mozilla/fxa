/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('tap').test
var TestServer = require('../test_server')
var crypto = require('crypto')
var Client = require('../client')
var config = require('../../config').getProperties()
// XXX: update this later to avoid issues.
process.env.NODE_ENV = 'dev'

TestServer.start(config)
.then(function main(server) {

  test(
    'unverified account fail when getting keys',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null
      return Client.create(config.publicUrl, email, password)
        .then(
          function (x) {
            client = x
            t.ok(client.authAt, 'authAt was set')
          }
        )
        .then(
          function () {
            return client.keys()
          }
        )
        .then(
          function (keys) {
            t.fail('got keys before verifying email')
          },
          function (err) {
            t.equal(err.errno, 104, 'Unverified account error code')
            t.equal(err.message, 'Unverified account', 'Unverified account error message')
          }
        )
    }
  )

  test(
    'create and verify account',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null
      return Client.create(config.publicUrl, email, password)
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
            t.equal(status.verified, false)
          }
        )
        .then(
          function () {
            return server.mailbox.waitForCode(email)
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
            t.equal(
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
            t.equal(status.verified, true)
          }
        )
    }
  )


  test(
    'create account with service identifier and resume',
    function (t) {
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
            t.equal(emailData.headers['x-service-id'], 'abcdef')
            t.ok(emailData.headers['x-link'].indexOf('resume=foo') > -1)
          }
        )
    }
  )

  test(
    'create account allows localization of emails',
    function (t) {
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
            t.assert(emailData.text.indexOf('Activate now') !== -1, 'not en-US')
            t.assert(emailData.text.indexOf('Ativar agora') === -1, 'not pt-BR')
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
            t.assert(emailData.text.indexOf('Activate now') === -1, 'not en-US')
            t.assert(emailData.text.indexOf('Ativar agora') !== -1, 'is pt-BR')
            return client.destroyAccount()
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
      return client.auth()
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
    '/account/create works with proper data',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'ilikepancakes'
      var client
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (x) {
            client = x
            t.ok(client.uid, 'account created')
          }
        ).then(
          function () {
            return client.login()
          }
        ).then(
          function () {
            t.ok(client.sessionToken, 'client can login')
          }
        )
    }
  )

  test(
    '/account/create returns a sessionToken',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'ilikepancakes'
      var client = new Client(config.publicUrl)
      return client.setupCredentials(email, password)
        .then(
          function (c) {
            return c.api.accountCreate(c.email, c.authPW)
              .then(
                function (response) {
                  t.ok(response.sessionToken, 'has a sessionToken')
                  t.equal(response.keyFetchToken, undefined, 'no keyFetchToken without keys=true')
                }
              )
          }
        )
    }
  )

  test(
    '/account/create returns a keyFetchToken when keys=true',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'ilikepancakes'
      var client = new Client(config.publicUrl)
      return client.setupCredentials(email, password)
        .then(
          function (c) {
            return c.api.accountCreate(c.email, c.authPW, { keys: true })
              .then(
                function (response) {
                  t.ok(response.sessionToken, 'has a sessionToken')
                  t.ok(response.keyFetchToken, 'keyFetchToken with keys=true')
                }
              )
          }
        )
    }
  )

  test(
    'signup with same email, different case',
    function (t) {
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
          t.fail,
          function (err) {
            t.equal(err.code, 400)
            t.equal(err.errno, 101, 'Account already exists')
          }
        )
    }
  )

  test(
    're-signup against an unverified email',
    function (t) {
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
            t.ok(client.uid, 'account created')
          }
        )
    }
  )

  test(
    'invalid redirectTo',
    function (t) {
      var api = new Client.Api(config.publicUrl)
      var email = server.uniqueEmail()
      var authPW = '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'
      var options = {
        redirectTo: 'http://accounts.firefox.com.evil.us'
      }
      return api.accountCreate(email, authPW, options)
      .then(
        t.fail,
        function (err) {
          t.equal(err.errno, 107, 'bad redirectTo rejected')
        }
      )
      .then(
        function () {
          return api.passwordForgotSendCode(email, options)
        }
      )
      .then(
        t.fail,
        function (err) {
          t.equal(err.errno, 107, 'bad redirectTo rejected')
        }
      )
    }
  )

  test(
    'another invalid redirectTo',
    function (t) {
      var api = new Client.Api(config.publicUrl)
      var email = server.uniqueEmail()
      var authPW = '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'
      var options = {
        redirectTo: 'https://www.fake.com/.firefox.com'
      }

      return api.accountCreate(email, authPW, options)
      .then(
        t.fail,
        function (err) {
          t.equal(err.errno, 107, 'bad redirectTo rejected')
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
        t.fail,
        function (err) {
          t.equal(err.errno, 107, 'bad redirectTo rejected')
        }
      )
    }
  )

  test(
    'create account with service query parameter',
    function (t) {
      var email = server.uniqueEmail()
      return Client.create(config.publicUrl, email, 'foo', { serviceQuery: 'bar' })
        .then(function () {
          return server.mailbox.waitForEmail(email)
        })
        .then(function (emailData) {
          t.equal(emailData.headers['x-service-id'], 'bar', 'service query parameter was propagated')
        })
    }
  )

  test(
    'account creation works with unicode email address',
    function (t) {
      var email = server.uniqueUnicodeEmail()
      return Client.create(config.publicUrl, email, 'foo')
        .then(function (client) {
          t.ok(client, 'created account')
          return server.mailbox.waitForEmail(email)
        })
        .then(function (emailData) {
          t.ok(emailData, 'received email')
        })
    }
  )

  test(
    'account creation works with minimal metricsContext metadata',
    function (t) {
      var email = server.uniqueEmail()
      return Client.create(config.publicUrl, email, 'foo', {
        metricsContext: {
          flowId: 'deadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00d',
          flowBeginTime: 1
        }
      }).then(function (client) {
        t.ok(client, 'created account')
      })
    }
  )

  test(
    'account creation fails with invalid metricsContext flowId',
    function (t) {
      var email = server.uniqueEmail()
      return Client.create(config.publicUrl, email, 'foo', {
        metricsContext: {
          flowId: 'deadbeefbaadf00ddeadbeefbaadf00d',
          flowBeginTime: 1
        }
      }).then(function () {
        t.fail('account creation should have failed')
      }, function (err) {
        t.ok(err, 'account creation failed')
      })
    }
  )

  test(
    'account creation fails with invalid metricsContext flowBeginTime',
    function (t) {
      var email = server.uniqueEmail()
      return Client.create(config.publicUrl, email, 'foo', {
        metricsContext: {
          flowId: 'deadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00d',
          flowBeginTime: 0
        }
      }).then(function () {
        t.fail('account creation should have failed')
      }, function (err) {
        t.ok(err, 'account creation failed')
      })
    }
  )

  test(
    'account creation works with maximal metricsContext metadata',
    function (t) {
      var email = server.uniqueEmail()
      return Client.create(config.publicUrl, email, 'foo', {
        metricsContext: {
          flowId: 'deadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00d',
          flowBeginTime: 1,
          context: 'foo',
          entrypoint: 'bar',
          migration: 'baz',
          service: 'qux',
          utmCampaign: 'wibble',
          utmContent: 'blurgh',
          utmMedium: 'blee',
          utmSource: 'fnarr',
          utmTerm: 'frang'
        }
      }).then(function (client) {
        t.ok(client, 'created account')
      })
    }
  )

  test(
    'account creation works with empty metricsContext metadata',
    function (t) {
      var email = server.uniqueEmail()
      return Client.create(config.publicUrl, email, 'foo', {
        metricsContext: {}
      }).then(function (client) {
        t.ok(client, 'created account')
      })
    }
  )

  test(
    'account creation fails with missing flowBeginTime',
    function (t) {
      var email = server.uniqueEmail()
      return Client.create(config.publicUrl, email, 'foo', {
        metricsContext: {
          flowId: 'deadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00ddeadbeefbaadf00d'
        }
      }).then(function () {
        t.fail('account creation should have failed')
      }, function (err) {
        t.ok(err, 'account creation failed')
      })
    }
  )

  test(
    'account creation fails with missing flowId',
    function (t) {
      var email = server.uniqueEmail()
      return Client.create(config.publicUrl, email, 'foo', {
        metricsContext: {
          flowBeginTime: Date.now()
        }
      }).then(function () {
        t.fail('account creation should have failed')
      }, function (err) {
        t.ok(err, 'account creation failed')
      })
    }
  )

  test(
    'create account for non-sync service does not get post-verify email',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null
      return Client.create(config.publicUrl, email, password)
        .then(
          function (x) {
            client = x
            t.ok('account was created')
          }
        )
        .then(
          function () {
            return server.mailbox.waitForCode(email)
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
            t.equal(status.verified, true)
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
            t.ok(code, 'the next email was reset-password, not post-verify')
          }
        )
    }
  )

  test(
    'create account for unspecified service does not get post-verify email',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null
      return Client.create(config.publicUrl, email, password)
        .then(
          function (x) {
            client = x
            t.ok('account was created')
          }
        )
        .then(
          function () {
            return server.mailbox.waitForCode(email)
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
            t.equal(status.verified, true)
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
            t.ok(code, 'the next email was reset-password, not post-verify')
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
