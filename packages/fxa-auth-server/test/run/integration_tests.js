/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('tap').test
var cp = require('child_process')
var crypto = require('crypto');
var Client = require('../../client')
var config = require('../../config').root()

process.env.DEV_VERIFIED = 'true'

var server = null

function uniqueID() {
  return crypto.randomBytes(10).toString('hex');
}

function main() {

  // Randomly-generated account names for testing.
  // This makes it easy to run the tests against an existing server
  // which may already have some accounts in its db.

  var email1 = uniqueID() + "@example.com"
  var email2 = uniqueID() + "@example.com"
  var email3 = uniqueID() + "@example.com"
  var email4 = uniqueID() + "@example.com"
  var email5 = uniqueID() + "@example.com"
  var email6 = uniqueID() + "@example.com"
  var email7 = uniqueID() + "@example.com"

  test(
    'Create account flow',
    function (t) {
      var email = email1
      var password = 'allyourbasearebelongtous'
      var client = null
      var publicKey = {
        "algorithm":"RS",
        "n":"4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123",
        "e":"65537"
      }
      var duration = 1000 * 60 * 60 * 24
      Client.create(config.public_url, email, password)
        .then(
          function (x) {
            client = x
            return client.keys()
          }
        )
        .then(
          function (keys) {
            t.equal(typeof(keys.kA), 'string', 'kA exists')
            t.equal(typeof(keys.wrapKb), 'string', 'wrapKb exists')
            t.equal(typeof(keys.kB), 'string', 'kB exists')
            t.equal(client.kB.length, 64, 'kB exists, has the right length')
          }
        )
        .then(
          function () {
            return client.sign(publicKey, duration)
          }
        )
        .then(
          function (cert) {
            t.equal(typeof(cert), 'string', 'cert exists')
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
    '(reduced security) Login with email and password',
    function (t) {
      var clientApi = new Client.Api(config.public_url)
      var email =  Buffer(email1).toString('hex')
      var password = 'allyourbasearebelongtous'
      clientApi.rawPasswordSessionCreate(email, password)
        .then(
          function (result) {
            t.equal(typeof(result.sessionToken), 'string', 'sessionToken exists')
            t.end()
          }
        )
    }
  )

  test(
    '(reduced security) Login with email and wrong password',
    function (t) {
      var clientApi = new Client.Api(config.public_url)
      var email =  Buffer(email1).toString('hex')
      var password = 'xxx'
      clientApi.rawPasswordSessionCreate(email, password)
        .then(
          function (result) {
            t.fail('login succeeded')
            t.end()
          },
          function (err) {
            t.equal(err.errno, 103)
            t.end()
          }
        )
    }
  )

  test(
    '(reduced security) Login with unknown email',
    function (t) {
      var clientApi = new Client.Api(config.public_url)
      var email =  Buffer('x@y.me').toString('hex')
      var password = 'allyourbasearebelongtous'
      clientApi.rawPasswordSessionCreate(email, password)
        .done(
          function (result) {
            t.fail('login succeeded')
            t.end()
          },
          function (err) {
            t.equal(err.errno, 102)
            t.end()
          }
        )
    }
  )

  test(
    '(reduced security) Create account',
    function (t) {
      var clientApi = new Client.Api(config.public_url)
      var email = Buffer(email5).toString('hex')
      var password = 'newPassword'
      clientApi.rawPasswordAccountCreate(email, password)
        .done(
          function (result) {
            var client = null
            t.equal(typeof(result.uid), 'string')
            Client.login(config.public_url, email5, password)
              .then(
                function (x) {
                  client = x
                  return client.keys()
                }
              )
              .then(
                function (keys) {
                  t.equal(typeof(keys.kA), 'string', 'kA exists')
                  t.equal(typeof(keys.wrapKb), 'string', 'wrapKb exists')
                  t.equal(client.kB.length, 64, 'kB exists, has the right length')
                  t.end()
                }
              )
          }
        )
    }
  )

  test(
    'Change password flow',
    function (t) {
      var email = email2
      var password = 'allyourbasearebelongtous'
      var newPassword = 'foobar'
      var wrapKb = null
      var client = null
      var firstSrpPw
      Client.create(config.public_url, email, password)
        .then(
          function (x) {
            client = x
            firstSrpPw = x.srpPw
            return client.keys()
          }
        )
        .then(
          function (keys) {
            wrapKb = keys.wrapKb
          }
        )
        .then(
          function () {
            return client.changePassword(newPassword)
          }
        )
        .then(
          function () {
            t.notEqual(client.srpPw, firstSrpPw, 'password has changed')
            return client.keys()
          }
        )
        .then(
          function (keys) {
            t.equal(keys.wrapKb, wrapKb, 'wrapKb is preserved')
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
    'Login flow',
    function (t) {
      var email = email2
      var password = 'foobar'
      var client = null
      var publicKey = {
        "algorithm":"RS",
        "n":"4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123",
        "e":"65537"
      }
      var duration = 1000 * 60 * 60 * 24
      Client.login(config.public_url, email, password)
        .then(
          function (x) {
            client = x
            return client.keys()
          }
        )
        .then(
          function (keys) {
            t.equal(typeof(keys.kA), 'string', 'kA exists')
            t.equal(typeof(keys.wrapKb), 'string', 'wrapKb exists')
            t.equal(client.kB.length, 64, 'kB exists, has the right length')
          }
        )
        .then(
          function () {
            return client.sign(publicKey, duration)
          }
        )
        .then(
          function (cert) {
            t.equal(typeof(cert), 'string', 'cert exists')
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
    'account destroy',
    function (t) {
      var email = email3
      var password = 'allyourbasearebelongtous'
      var client = null
      Client.create(config.public_url, email, password)
        .then(
          function (x) {
            client = x
            return client.devices()
          }
        )
        .then(
          function (devices) {
            t.equal(devices.length, 1, 'we have an account')
            return client.destroyAccount()
          }
        )
        .then(
          function () {
            return client.keys()
          }
        )
        .done(
          function (keys) {
            t.fail('account not destroyed')
            t.end()
          },
          function (err) {
            t.equal(err.message, 'Unknown account', 'account destroyed')
            t.end()
          }
        )
    }
  )

  test(
    'session destroy',
    function (t) {
      var email = email4
      var password = 'foobar'
      var client = null
      var sessionToken = null
      Client.create(config.public_url, email, password)
        .then(
          function (x) {
            client = x
            return client.devices()
          }
        )
        .then(
          function () {
            sessionToken = client.sessionToken
            return client.destroySession()
          }
        )
        .then(
          function () {
            t.equal(client.sessionToken, null, 'session token deleted')
            client.sessionToken = sessionToken
            return client.devices()
          }
        )
        .done(
          function (devices) {
            t.fail('got devices with destroyed session')
            t.end()
          },
          function (err) {
            t.equal(err.errno, 110, 'session is invalid')
            t.end()
          }
        )
    }
  )

  test(
    'Unknown account should not exist',
    function (t) {
      var email = email6
      var client = new Client(config.public_url)
      client.accountExists(email)
        .then(
          function (exists) {
            t.equal(exists, false, "account shouldn't exist")
            t.end()
          }
        )
    }
  )

  test(
    'Known account should exist',
    function (t) {
      var email = email7
      var password = 'ilikepancakes'
      var client
      Client.create(config.public_url, email, password)
        .then(
          function (x) {
            client = x
            return client.accountExists()
          }
        ).then(
          function (exists) {
            t.equal(exists, true, "account should exist")
            return client.login()
          }
        ).done(
          function () {
            t.ok(client.sessionToken, "client can login after accountExists")
            t.end()
          }
        )
    }
  )

  test(
    'random bytes',
    function (t) {
      var client = new Client(config.public_url)
      client.api.getRandomBytes()
        .done(
          function (x) {
            t.equal(x.data.length, 64)
            t.end()
          }
        )
    }
  )

  test(
    'oversized payload',
    function (t) {
      var client = new Client(config.public_url)
      client.api.doRequest(
        'POST',
        client.api.baseURL + '/get_random_bytes',
        null,
        { big: Buffer(1024 * 512).toString('hex')}
      )
      .then(
        function () {
          t.fail('request should have failed')
          t.end()
        },
        function (err) {
          t.equal(err.errno, 113, 'payload too large')
          t.end()
        }
      )
    }
  )

  test(
    'HAWK timestamp',
    function (t) {
      var email = email1
      var password = 'allyourbasearebelongtous'
      var url = null
      Client.login(config.public_url, email, password)
        .then(
          function (c) {
            url = c.api.baseURL + '/account/keys'
            return c.api.Token.KeyFetchToken.fromHex(c.keyFetchToken)
          }
        )
        .then(
          function (token) {
            var hawk = require('hawk')
            var request = require('request')
            var method = 'GET'
            var verify = {
              credentials: token,
              timestamp: Math.floor(Date.now() / 1000) - 61
            }
            var headers = {
              Authorization: hawk.client.header(url, method, verify).field
            }
            request(
              {
                method: method,
                url: url,
                headers: headers,
                json: true
              },
              function (err, res, body) {
                t.equal(body.errno, 111, 'invalid auth timestamp')
                t.end()
              }
            )
          }
        )
    }
  )

  test(
    'teardown',
    function (t) {
      if (server) server.kill('SIGINT')
      t.end()
    }
  )
}

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
        if (err.errno !== 'ECONNREFUSED') {
            console.log("ERROR: unexpected result from " + config.public_url);
            console.log(err);
            return err;
        }
        if (!server) {
          server = startServer()
        }
        console.log('waiting...')
        setTimeout(waitLoop, 100)
      }
    )
}

waitLoop()
