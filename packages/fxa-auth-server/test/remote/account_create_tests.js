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
    'create account',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null
      var verifyCode = null
      var keyFetchToken = null
      return Client.create(config.publicUrl, email, password)
        .then(
          function (x) {
            client = x
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
          function (code) {
            verifyCode = code
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
            t.equal(code, verifyCode, 'verify codes are the same')
          }
        )
        .then(
          function () {
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
        .then(
          function () {
            return server.assertLogs(t, {
              'account-create-success': 1,
              'account-verify-request': 1,
              'account-verify-success': 1,
              'account-verify-failure': 0
            })
          }
        )
    }
  )

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
        .then(
          function () {
            return server.assertLogs(t, {
              'account-create-success': 1,
              'account-verify-request': 2,
              'account-verify-success': 0,
              'account-verify-failure': 0
            })
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
            t.assert(emailData.text.indexOf('Welcome') !== -1, 'is en')
            t.assert(emailData.text.indexOf('GDay') === -1, 'not en-AU')
            return client.destroyAccount()
          }
        )
        .then(
          function () {
            return Client.create(config.publicUrl, email, password, { lang: 'en-AU' })
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
            t.assert(emailData.text.indexOf('Welcome') === -1, 'not en')
            t.assert(emailData.text.indexOf('GDay') !== -1, 'is en-AU')
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
            t.ok(client.sessionToken, "client can login")
          }
        )
    }
  )

  test(
    '/account/create with malformed email address',
    function (t) {
      var email = 'notAnEmailAddress'
      var password = '123456'
      return Client.create(config.publicUrl, email, password, server.mailbox)
        .then(
          t.fail,
          function (err) {
            t.equal(err.code, 400, 'malformed email is rejected')
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
      return Client.create(config.publicUrl, email, password, server.mailbox)
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
    'invalid redirectTo',
    function (t) {
      var api = new Client.Api(config.publicUrl)
      var email = server.uniqueEmail()
      var options = {
        redirectTo: 'http://accounts.firefox.com.evil.us'
      }
      return api.accountCreate(email, '123456', options)
      .then(
        t.fail,
        function (err) {
          t.equal(err.code, 400, 'bad redirectTo rejected')
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
          t.equal(err.code, 400, 'bad redirectTo rejected')
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
