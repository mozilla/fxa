/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Client = require('../client')
var crypto = require('crypto')
var test = require('../ptaptest')
var TestServer = require('../test_server')
var url = require('url')

var config = require('../../config').getProperties()

TestServer.start(config)
.then(function main(server) {

  test(
    'the email is returned in the error on Incorrect password errors',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'abcdef'
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (c) {
            return Client.login(config.publicUrl, email, password + 'x')
          }
        )
        .then(
          t.fail,
          function (err) {
            t.equal(err.code, 400)
            t.equal(err.errno, 103)
            t.equal(err.email, email)
          }
        )
    }
  )

  test(
    'the email is returned in the error on Incorrect email case errors with correct password',
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
            t.equal(err.errno, 120)
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
    'No keyFetchToken without keys=true',
    function (t) {
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
            t.equal(c.keyFetchToken, null, 'should not have keyFetchToken')
          }
        )
    }
  )

  test(
    'log in to locked account',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'wibble'
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (client) {
            return client.lockAccount()
          }
        )
        .then(
          function () {
            return Client.login(config.publicUrl, email, password)
          }
        )
        .then(
          function () {
            t.fail('account should fail to log in')
          },
          function (err) {
            t.equal(err.code, 400)
            t.equal(err.error, 'Bad Request')
            t.equal(err.errno, 121)
            t.equal(err.message, 'Account is locked')
          }
        )
    }
  )

  test(
    'login works with unicode email address',
    function (t) {
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
            t.ok(client, 'logged in to account')
          }
        )
    }
  )

  test(
    'account login works with minimal metricsContext metadata',
    function (t) {
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
          t.ok(client, 'logged in to account')
        })
    }
  )

  test(
    'account login fails with invalid metricsContext flowId',
    function (t) {
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
          t.fail('account login should have failed')
        }, function (err) {
          t.ok(err, 'account login failed')
        })
    }
  )

  test(
    'account login fails with invalid metricsContext flowBeginTime',
    function (t) {
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
          t.fail('account login should have failed')
        }, function (err) {
          t.ok(err, 'account login failed')
        })
    }
  )

  test(
    'signin sends an email if keys are requested',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'abcdef'
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function () {
            return Client.login(config.publicUrl, email, password, { keys: 'true' })
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email)
          }
        )
        .then(
          function (emailData) {
            var changeUrl = url.parse(emailData.headers['x-link'], true)
            t.strictEqual(
              changeUrl.href.indexOf(config.smtp.initiatePasswordChangeUrl), 0,
              'links to change password'
            )
            t.equal(changeUrl.query.email, email, 'with email querystring')
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
