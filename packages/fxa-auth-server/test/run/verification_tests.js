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

TestServer.start(config.publicUrl)
.done(function main(server) {

  test(
    'create account',
    function (t) {
      var email = uniqueID() +'@restmail.net'
      var password = 'allyourbasearebelongtous'
      var client = null
      var verifyCode = null
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
      var email = uniqueID() +'@restmail.net'
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
    'create account with service identifier',
    function (t) {
      var email = uniqueID() +'@example.com'
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
            return waitForEmail(email)
          }
        )
        .then(
          function (emailData) {
            t.equal(emailData.headers['x-service-id'], 'abcdef')
            client.service = '123456'
            return client.requestVerifyEmail()
          }
        )
        .then(
          function () {
            return waitForEmail(email)
          }
        )
        .then(
          function (emailData) {
            t.equal(emailData.headers['x-service-id'], '123456')
            client.service = null
            return client.requestVerifyEmail()
          }
        )
        .then(
          function () {
            return waitForEmail(email)
          }
        )
        .then(
          function (emailData) {
            t.equal(emailData.headers['x-service-id'], undefined)
          }
        )
    }
  )

  test(
    'forgot password',
    function (t) {
      var email = uniqueID() +'@restmail.net'
      var password = 'allyourbasearebelongtous'
      var newPassword = 'ez'
      var wrapKb = null
      var kA = null
      var client = null
      return createFreshAccount(email, password)
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
    '/raw_password/password/reset forgot password',
    function (t) {
      var email = uniqueID() +'@restmail.net'
      var password = 'allyourbasearebelongtous'
      var newPassword = 'ez'
      var wrapKb = null
      var kA = null
      var client = null
      return createFreshAccount(email, password)
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
      var email = uniqueID() +'@restmail.net'
      var password = "hothamburger"
      var client = null
      return createFreshAccount(email, password)
        .then(
          function () {
            client = new Client(config.publicUrl)
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
      var email = uniqueID() +'@restmail.net'
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
            return waitForEmail(email)
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
            return waitForEmail(email)
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
  return Client.create(config.publicUrl, email, password)
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
        return emailData.headers['x-verify-code'] || emailData.headers['x-recovery-code']
      }
    )
}

function loop(name, tries, cb) {
  var url = 'http://' + config.smtp.api.host + ':' + config.smtp.api.port + '/mail/' + name
  console.log('checking mail', url)
  request({ url: url, method: 'GET' },
    function (err, res, body) {
      console.log('mail status', res && res.statusCode, 'tries', tries)
      var json = null
      try {
        json = JSON.parse(body)[0]
      }
      catch (e) {
        return cb(e)
      }

      if(!json) {
        if (tries === 0) {
          return cb(new Error('could not get mail for ' + url))
        }
        return setTimeout(loop.bind(null, name, --tries, cb), 1000)
      }
      console.log('deleting mail', url)
      request({ url: url, method: 'DELETE' },
        function (err, res, body) {
          cb(err, json)
        }
      )
    }
  )
}

function waitForEmail(email) {
  var d = P.defer()
  loop(email.split('@')[0], 20, function (err, json) {
    return err ? d.reject(err) : d.resolve(json)
  })
  return d.promise
}


function resetPassword(client, code, newPassword) {
  return client.verifyPasswordResetCode(code)
    .then(function() {
      return client.resetPassword(newPassword)
    })
}
