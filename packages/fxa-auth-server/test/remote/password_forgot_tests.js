/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var url = require('url')
var Client = require('../client')
var TestServer = require('../test_server')


var config = require('../../config').root()

TestServer.start(config)
.then(function main(server) {

  test(
    'forgot password',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var newPassword = 'ez'
      var wrapKb = null
      var kA = null
      var client = null
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function () {
            return Client.login(config.publicUrl, email, password)
          }
        )
        .then(
          function (x) {
            client = x
            return client.keys()
          }
        )
        .then(
          function (keys) {
            wrapKb = keys.wrapKb
            kA = keys.kA
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
            t.throws(function() { client.resetPassword(newPassword); })
            return resetPassword(client, code, newPassword)
          }
        )
        .then(
          function () {
            return client.keys()
          }
        )
        .then(
          function (keys) {
            t.ok(Buffer.isBuffer(keys.wrapKb), 'yep, wrapKb')
            t.notDeepEqual(wrapKb, keys.wrapKb, 'wrapKb was reset')
            t.deepEqual(kA, keys.kA, 'kA was not reset')
            t.equal(client.kB.length, 32, 'kB exists, has the right length')
          }
        )
        .then( // make sure we can still login after password reset
          function () {
            return Client.login(config.publicUrl, email, newPassword)
          }
        )
        .then(
          function (x) {
            client = x
            return client.keys()
          }
        )
        .then(
          function (keys) {
            t.ok(Buffer.isBuffer(keys.kA), 'kA exists, login after password reset')
            t.ok(Buffer.isBuffer(keys.wrapKb), 'wrapKb exists, login after password reset')
            t.equal(client.kB.length, 32, 'kB exists, has the right length')
          }
        )
    }
  )

  test(
    'forgot password limits verify attempts',
    function (t) {
      var code = null
      var email = server.uniqueEmail()
      var password = "hothamburger"
      var client = null
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function () {
            client = new Client(config.publicUrl)
            client.email = email
            return client.forgotPassword()
          }
        )
        .then(
          function () {
            return server.mailbox.waitForCode(email)
          }
        )
        .then(
          function (c) {
            code = c
          }
        )
        .then(
          function () {
            return client.reforgotPassword()
          }
        )
        .then(
          function (resp) {
            return server.mailbox.waitForCode(email)
          }
        )
        .then(
          function (c) {
            t.equal(code, c, 'same code as before')
          }
        )
        .then(
          function () {
            return resetPassword(client, '00000000000000000000000000000000', 'password')
          }
        )
        .then(
          function () {
            t.fail('reset password with bad code')
          },
          function (err) {
            t.equal(err.tries, 2, 'used a try')
            t.equal(err.message, 'Invalid verification code', 'bad attempt 1')
          }
        )
        .then(
          function () {
            return resetPassword(client, '00000000000000000000000000000000', 'password')
          }
        )
        .then(
          function () {
            t.fail('reset password with bad code')
          },
          function (err) {
            t.equal(err.tries, 1, 'used a try')
            t.equal(err.message, 'Invalid verification code', 'bad attempt 2')
          }
        )
        .then(
          function () {
            return resetPassword(client, '00000000000000000000000000000000', 'password')
          }
        )
        .then(
          function () {
            t.fail('reset password with bad code')
          },
          function (err) {
            t.equal(err.tries, 0, 'used a try')
            t.equal(err.message, 'Invalid verification code', 'bad attempt 3')
          }
        )
        .then(
          function () {
            return resetPassword(client, '00000000000000000000000000000000', 'password')
          }
        )
        .then(
          function () {
            t.fail('reset password with invalid token')
          },
          function (err) {
            t.equal(err.message, 'Invalid authentication token in request signature', 'token is now invalid')
          }
        )
    }
  )

  test(
    'recovery email link',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'something'
      var client = null
      var options = {
        redirectTo: 'https://sync.firefox.com',
        service: 'sync'
      }
      return Client.create(config.publicUrl, email, password, options)
        .then(
          function (c) {
            client = c
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email)
          }
        )
        .then(
          function () {
            return client.forgotPassword()
          }
        )
        .then(
          function () {
            return server.mailbox.waitForEmail(email)
          }
        )
        .then(
          function (emailData) {
            var link = emailData.headers['x-link']
            var query = url.parse(link, true).query
            t.ok(query.token, 'uid is in link')
            t.ok(query.code, 'code is in link')
            t.equal(query.redirectTo, options.redirectTo, 'redirectTo is in link')
            t.equal(query.service, options.service, 'service is in link')
            t.equal(query.email, email, 'email is in link')
          }
        )
    }
  )

  test(
    'password forgot status with valid token',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'something'
      return Client.create(config.publicUrl, email, password)
        .then(
          function (c) {
            return c.forgotPassword()
              .then(
                function () {
                  return c.api.passwordForgotStatus(c.passwordForgotToken)
                }
              )
              .then(
                function (x) {
                  t.equal(x.tries, 3, 'three tries remaining')
                  t.ok(x.ttl > 0 && x.ttl < (60*60), 'ttl is ok')
                }
              )
          }
        )
    }
  )

  test(
    'password forgot status with invalid token',
    function (t) {
      var client = new Client(config.publicUrl)
      return client.api.passwordForgotStatus('0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF')
        .then(
          t.fail,
          function (err) {
            t.equal(err.errno, 110, 'invalid token')
          }
        )
    }
  )

  test(
    '/password/forgot/verify_code should set an unverified account as verified',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'something'
      var client = null
      return Client.create(config.publicUrl, email, password)
        .then(function (c) { client = c })
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            t.equal(status.verified, false, 'email unverified')
          }
        )
        .then(
          function () {
            return server.mailbox.waitForCode(email) // ignore this code
          }
        )
        .then(
          function () {
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
            return client.verifyPasswordResetCode(code)
          }
        )
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            t.equal(status.verified, true, 'email verified')
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

function resetPassword(client, code, newPassword) {
  return client.verifyPasswordResetCode(code)
    .then(function() {
      return client.resetPassword(newPassword)
    })
}
