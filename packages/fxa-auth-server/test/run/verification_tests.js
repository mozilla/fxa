/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('tap').test
var cp = require('child_process')
var path = require('path')
var P = require('p-promise')
var Client = require('../../client')
var crypto = require('crypto')

process.env.CONFIG_FILES = path.join(__dirname, '../config/verification.json')
var config = require('../../config').root()

var HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/

function uniqueID() {
  return crypto.randomBytes(10).toString('hex');
}

function main() {

  test(
    'create account',
    function (t) {
      var email = uniqueID() +'@example.com'
      var password = 'allyourbasearebelongtous'
      var client = null
      var verifyCode = null
      Client.create(config.public_url, email, password)
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
        .done(
          function () {
            t.end()
          },
          function (err) {
            t.fail(err.message || err.error)
            t.end()
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
      Client.create(config.public_url, email, password)
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
        .done(
          function () {
            t.end()
          },
          function (err) {
            t.fail(err.message || err.error)
            t.end()
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
      createFreshAccount(email, password)
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
            t.ok(HEX_STRING.test(keys.wrapKb), 'yep, hex')
            t.notEqual(wrapKb, keys.wrapKb, 'wrapKb was reset')
            t.equal(kA, keys.kA, 'kA was not reset')
            t.equal(client.kB.length, 64, 'kB exists, has the right length')
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
            t.equal(typeof(keys.kA), 'string', 'kA exists, login after password reset')
            t.equal(typeof(keys.wrapKb), 'string', 'wrapKb exists, login after password reset')
            t.equal(client.kB.length, 64, 'kB exists, has the right length')
          }
        )
        .done(
          function () {
            t.end()
          },
          function (err) {
            t.fail(err.message || err.error)
            t.end()
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
      createFreshAccount(email, password)
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
        .done(
          function () {
            t.end()
          },
          function (err) {
            t.fail(JSON.stringify(err))
            t.end()
          }
        )
    }
  )

  test(
    'teardown',
    function (t) {
      mail.stop()
      server.kill('SIGINT')
      t.end()
    }
  )
}

///////////////////////////////////////////////////////////////////////////////

var Mail = require('lazysmtp').Mail
var mail = new Mail('127.0.0.1', true)

var codeMatch = /X-\w+-Code: (\w+)/
var toMatch = /To: (\w+@\w+\.\w+)/
var emailCodes = {}

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

mail.on(
  'mail',
  function (email) {
    var matchCode = codeMatch.exec(email)
    var matchEmail = toMatch.exec(email)
    if (matchCode && matchEmail) {
      emailCodes[matchEmail[1]] = matchCode[1]
    }
    else {
      console.error('No verify code match')
      console.error(email)
    }
  }
)
mail.start(9999)

function waitForCode(email) {
  var d = P.defer()
  function loop() {
    var code
    if (!emailCodes[email]) {
      return setTimeout(loop, 10)
    }
    code = emailCodes[email]
    emailCodes[email] = null
    d.resolve(code)
  }
  loop()
  return d.promise
}

var server = null

function startServer() {
  var server = cp.spawn(
    'node',
    ['../../bin/key_server.js'],
    {
      cwd: __dirname
    }
  )

  server.stdout.on('data', process.stdout.write.bind(process.stdout))
  server.stderr.on('data', process.stderr.write.bind(process.stderr))
  return server
}

function waitLoop() {
  Client.Api.heartbeat(config.public_url)
    .done(
      main,
      function (err) {
        if (!server) {
          server = startServer()
        }
        console.log('waiting...')
        setTimeout(waitLoop, 100)
      }
    )
}

waitLoop()


function resetPassword(client, code, newPassword) {
  return client.verifyPasswordResetCode(code)
    .then(function() {
      return client.resetPassword(newPassword)
    })
}
