/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var path = require('path')
var crypto = require('crypto')
var Client = require('../../client')
var P = require('../../promise')

process.env.CONFIG_FILES = path.join(__dirname, '../config/account_tests.json')
var config = require('../../config').root()

TestServer.start(config)
.then(function main(server) {

  test(
    'create account',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null
      var keyFetchToken = null
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
            keyFetchToken = client.keyFetchToken
            t.ok(client.keyFetchToken, 'retained keyFetchToken')
            t.equal(err.message, 'Unverified account', 'account is unverified')
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
            return client.verifyEmail(verifyCode)
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
            t.equal(keyFetchToken, client.keyFetchToken, 'reusing keyFetchToken')
            return client.keys()
          }
        )
    }
  )

/*/ TODO: revisit after the "dumb" resend logic is updated
  test(
    'create account with service identifier',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null
      var options = { service: 'abcdef' }
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
            client.options.service = '123456'
            return client.requestVerifyEmail()
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email)
          }
        )
        .then(
          function (emailData) {
            t.equal(emailData.headers['x-service-id'], '123456')
            client.options.service = null
            return client.requestVerifyEmail()
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email)
          }
        )
        .then(
          function (emailData) {
            t.equal(emailData.headers['x-service-id'], undefined)
          }
        )
    }
  )
/*/
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
            t.assert(emailData.text.indexOf('Verify') !== -1, 'is en-US')
            t.assert(emailData.text.indexOf('Verificar') === -1, 'not pt-BR')
            return client.destroyAccount()
          }
        )
        .then(
          function () {
            return Client.create(config.publicUrl, email, password, { lang: 'pt-BR' })
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
            t.assert(emailData.text.indexOf('Verify') === -1, 'not en-US')
            t.assert(emailData.text.indexOf('Verificar') !== -1, 'is pt-BR')
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
    '/account/create with a variety of malformed email addresses',
    function (t) {
      var pwd = '123456'

      var emails = [
        'notAnEmailAddress',
        '\n@example.com',
        'me@hello world.com',
        'me@hello+world.com',
        'me@.example',
        'me@example.com-',
        'me@example..com',
        'me@example-.com',
        'me@example.-com',
      ]
      emails.forEach(function(email, i) {
        emails[i] = Client.create(config.publicUrl, email, pwd)
          .then(
            t.fail,
            function (err) {
              t.equal(err.code, 400, 'http 400 : malformed email is rejected')
            }
          )
      })

      return P.all(emails)
    }
  )

  test(
    '/account/create with a variety of unusual but valid email addresses',
    function (t) {
      var pwd = '123456'

      var emails = [
        'tim@tim-example.net',
        'a+b+c@example.com',
        '#!?-@t-e-s-t.c-o-m',
        String.fromCharCode(1234) + '@example.com',
        'test@' + String.fromCharCode(5678) + '.com',
      ]

      emails.forEach(function(email, i) {
        emails[i] = Client.create(config.publicUrl, email, pwd)
          .then(
            function(c) {
              t.pass('Email ' + email + ' is valid')
              return c.destroyAccount()
            },
            function (err) {
              t.fail('Email address ' + email + " should have been allowed, but it wasn't")
            }
          )
      })

      return P.all(emails)
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
            return Client.create(config.publicUrl, email2, password, server.mailbox)
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
      return Client.create(config.publicUrl, email, password, server.mailbox)
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
    'teardown',
    function (t) {
      server.stop()
      t.end()
    }
  )
})
