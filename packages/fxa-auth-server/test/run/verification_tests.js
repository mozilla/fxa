/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var path = require('path')
var P = require('p-promise')
var Client = require('../../client')
var crypto = require('crypto')

process.env.CONFIG_FILES = path.join(__dirname, '../config/verification.json')
var config = require('../../config').root()

function uniqueID() {
  return crypto.randomBytes(10).toString('hex');
}

TestServer.start(config.public_url)
.done(function main(server) {

  test(
    'create account',
    function (t) {
      var email = uniqueID() +'@example.com'
      var password = 'allyourbasearebelongtous'
      var client = null
      var verifyCode = null
      return Client.create(config.public_url, email, password)
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
            return waitForCode(email)
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
            return waitForCode(email)
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
            return client.keys()
          }
        )
    }
  )

  test(
    'create account verify with incorrect code',
    function (t) {
      var email = uniqueID() +'@example.com'
      var password = 'allyourbasearebelongtous'
      var client = null
      return Client.create(config.public_url, email, password)
        .then(
          function (x) {
            client = x
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
            return client.verifyEmail('badcode')
          }
        )
        .then(
          function () {
            t.fail('verified email with bad code')
          },
          function (err) {
            t.equal(err.message.toString(), 'Invalid verification code', 'bad attempt')
          }
        )
        .then(
          function () {
            return client.emailStatus()
          }
        )
        .then(
          function (status) {
            t.equal(status.verified, false, 'account not verified')
          }
        )
    }
  )

  test(
    'forgot password',
    function (t) {
      var email = uniqueID() +'@example.com'
      var password = 'allyourbasearebelongtous'
      var newPassword = 'ez'
      var wrapKb = null
      var kA = null
      var client = null
      return createFreshAccount(email, password)
        .then(
          function () {
            return Client.login(config.public_url, email, password)
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
            return waitForCode(email)
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
            return Client.login(config.public_url, email, newPassword)
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
    '/raw_password/password/reset forgot password',
    function (t) {
      var email = uniqueID() +'@example.com'
      var password = 'allyourbasearebelongtous'
      var newPassword = 'ez'
      var wrapKb = null
      var kA = null
      var client = null
      return createFreshAccount(email, password)
        .then(
          function () {
            return Client.login(config.public_url, email, password)
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
            return waitForCode(email)
          }
        )
        .then(
          function (code) {
            return client.verifyPasswordResetCode(code)
          }
        )
        .then(
          function () {
            return client.api.rawPasswordPasswordReset(client.accountResetToken, newPassword)
          }
        )
        .then( // make sure we can still login after password reset
          function () {
            return Client.login(config.public_url, email, newPassword)
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
            t.notDeepEqual(wrapKb, keys.wrapKb, 'wrapKb was reset')
            t.deepEqual(kA, keys.kA, 'kA was not reset')
            t.equal(client.kB.length, 32, 'kB exists, has the right length')
          }
        )
    }
  )

  test(
    'forgot password limits verify attempts',
    function (t) {
      var code = null
      var email = uniqueID() +'@example.com'
      var password = "hothamburger"
      var client = null
      return createFreshAccount(email, password)
        .then(
          function () {
            client = new Client(config.public_url)
            client.email = Buffer(email).toString('hex')
            return client.forgotPassword()
          }
        )
        .then(
          function () {
            return waitForCode(email)
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
            return waitForCode(email)
          }
        )
        .then(
          function (c) {
            t.equal(code, c, 'same code as before')
          }
        )
        .then(
          function () {
            return resetPassword(client, 'wrongcode', 'password')
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
            return resetPassword(client, 'wrongcode', 'password')
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
            return resetPassword(client, 'wrongcode', 'password')
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
            return resetPassword(client, 'wrongcode', 'password')
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
    'create account allows localization of emails',
    function (t) {
      var email = uniqueID() +'@example.com'
      var password = 'allyourbasearebelongtous'
      var client = null
      return Client.create(config.public_url, email, password)
        .then(
          function (x) {
            client = x
          }
        )
        .then(
          function () {
            return waitForEmail(email)
          }
        )
        .then(
          function (emailData) {
            t.assert(emailData.body.indexOf('Welcome') !== -1, 'is en')
            t.assert(emailData.body.indexOf('GDay') === -1, 'not en-AU')
            return client.destroyAccount()
          }
        )
        .then(
          function () {
            return Client.create(config.public_url, email, password, { lang: 'en-AU' })
          }
        )
        .then(
          function (x) {
            client = x
          }
        )
        .then(
          function () {
            return waitForEmail(email)
          }
        )
        .then(
          function (emailData) {
            t.assert(emailData.body.indexOf('Welcome') === -1, 'not en')
            t.assert(emailData.body.indexOf('GDay') !== -1, 'is en-AU')
            return client.destroyAccount()
          }
        )
    }
  )

  test(
    'teardown',
    function (t) {
      t.end()
      server.stop()
    }
  )
})

///////////////////////////////////////////////////////////////////////////////

var request = require('request')

// This test helper creates fresh account for the given email and password.
function createFreshAccount(email, password) {
  var client = null
  return Client.create(config.public_url, email, password)
    .then(
      function (x) {
        client = x
      }
    )
    .then(
      function () {
        return waitForCode(email)
      }
    )
    .then(
      function (code) {
        return client.verifyEmail(code)
      }
    )
}


function waitForCode(email) {
  return waitForEmail(email)
    .then(
      function (emailData) {
        return emailData.code;
      }
    )
}


function waitForEmail(email) {
  var d = P.defer()
  request(
    {
      url: 'http://' + config.smtp.api.host + ':' + config.smtp.api.port + '/pop',
      method: 'POST',
      json: { email: email }
    },
    function (err, res, body) {
      return err ? d.reject(err) : d.resolve(body)
    }
  )
  return d.promise
}


function resetPassword(client, code, newPassword) {
  return client.verifyPasswordResetCode(code)
    .then(function() {
      return client.resetPassword(newPassword)
    })
}
