/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var crypto = require('crypto')
var Client = require('../../client')
var TestServer = require('../test_server')
var P = require('../../promise')
var config = require('../../config').root()
var jwcrypto = require('jwcrypto')

function uniqueID() {
  return crypto.randomBytes(10).toString('hex');
}

TestServer.start(config.publicUrl)
.then(function main(server) {

  // Randomly-generated account names for testing.
  // This makes it easy to run the tests against an existing server
  // which may already have some accounts in its db.

  var email1 = uniqueID() + "@example.com"
  var email2 = uniqueID() + "@example.com"
  var email3 = uniqueID() + "@example.com"
  var email4 = uniqueID() + "@example.com"
  var email5 = uniqueID() + "@example.com"
  var email6 = uniqueID() + "@example.com"

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
      return Client.create(config.publicUrl, email, password, { preVerified: true })
        .then(
          function (x) {
            client = x
            return client.keys()
          }
        )
        .then(
          function (keys) {
            t.ok(Buffer.isBuffer(keys.kA), 'kA exists')
            t.ok(Buffer.isBuffer(keys.wrapKb), 'wrapKb exists')
            t.ok(Buffer.isBuffer(keys.kB), 'kB exists')
            t.equal(client.kB.length, 32, 'kB exists, has the right length')
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
            var payload = jwcrypto.extractComponents(cert).payload
            t.equal(payload.principal.email.split('@')[0], client.uid, 'cert has correct uid')
          }
        )
        .then(
          function () {
            return server.assertLogs(t, {
              'account-create-success': 1,
              'login-success': 1
            })
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
      var kB = null
      var client = null
      var firstAuthPW
      return Client.create(config.publicUrl, email, password, { preVerified: true })
        .then(
          function (x) {
            client = x
            firstAuthPW = x.authPW.toString('hex')
            return client.keys()
          }
        )
        .then(
          function (keys) {
            kB = keys.kB
          }
        )
        .then(
          function () {
            return client.changePassword(newPassword)
          }
        )
        .then(
          function () {
            t.notEqual(client.authPW.toString('hex'), firstAuthPW, 'password has changed')
            return client.keys()
          }
        )
        .then(
          function (keys) {
            t.deepEqual(keys.kB, kB, 'kB is preserved')
            t.equal(client.kB.length, 32, 'kB exists, has the right length')
          }
        )
        .then(
          function () {
            return server.assertLogs(t, {
              'login-success': 2,
              'pwd-change-request': 1,
              'pwd-reset-success': 1,
              'auth-failure': 0
            })
          }
        )
    }
  )

  test(
    'Login flow',
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
      return Client.login(config.publicUrl, email, password)
        .then(
          function (x) {
            client = x
            t.ok(client.uid, 'got a uid')
            t.equal(client.verified, true, 'email is verified')
            return client.keys()
          }
        )
        .then(
          function (keys) {
            t.ok(Buffer.isBuffer(keys.kA), 'kA exists')
            t.ok(Buffer.isBuffer(keys.wrapKb), 'wrapKb exists')
            t.ok(Buffer.isBuffer(keys.kB), 'kB exists')
            t.equal(client.kB.length, 32, 'kB exists, has the right length')
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
        .then(
          function () {
            return server.assertLogs(t, {
              'login-success': 1,
              'auth-failure': 0
            })
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
      return Client.create(config.publicUrl, email, password, { preVerified: true })
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
        .then(
          function (keys) {
            t.fail('account not destroyed')
          },
          function (err) {
            t.equal(err.message, 'Unknown account', 'account destroyed')
          }
        )
        .then(
          function () {
            return server.assertLogs(t, {
              'login-success': 1,
              'account-destroy': 1,
              'auth-failure': 0
            })
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
      return Client.create(config.publicUrl, email, password, { preVerified: true })
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
        .then(
          function (devices) {
            t.fail('got devices with destroyed session')
          },
          function (err) {
            t.equal(err.errno, 110, 'session is invalid')
          }
        )
        .then(
          function () {
            return server.assertLogs(t, {
              'login-success': 1,
              'session-create': 1,
              'session-destroy': 1,
            })
          }
        )
    }
  )

  test(
    'Unknown account should not exist',
    function (t) {
      var client = new Client(config.publicUrl)
      client.email = email5
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
    'Known account should exist',
    function (t) {
      var email = email6
      var password = 'ilikepancakes'
      var client
      return Client.create(config.publicUrl, email, password, { preVerified: true })
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
    'random bytes',
    function (t) {
      var client = new Client(config.publicUrl)
      return client.api.getRandomBytes()
        .then(
          function (x) {
            t.equal(x.data.length, 64)
          }
        )
    }
  )

  test(
    'oversized payload',
    function (t) {
      var client = new Client(config.publicUrl)
      return client.api.doRequest(
        'POST',
        client.api.baseURL + '/get_random_bytes',
        null,
        { big: Buffer(1024 * 512).toString('hex')}
      )
      .then(
        function () {
          t.fail('request should have failed')
        },
        function (err) {
          t.equal(err.errno, 113, 'payload too large')
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
      return Client.login(config.publicUrl, email, password)
        .then(
          function (c) {
            url = c.api.baseURL + '/account/keys'
            return c.api.Token.KeyFetchToken.fromHex(c.keyFetchToken)
          }
        )
        .then(
          function (token) {
            var d = P.defer()
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
                if (err) {
                  d.reject(err)
                } else {
                  t.equal(body.errno, 111, 'invalid auth timestamp')
                  var now = +new Date() / 1000
                  t.ok(body.serverTime > now - 5, 'includes current time')
                  t.ok(body.serverTime < now + 5, 'includes current time')
                  d.resolve()
                }
              }
            )
            return d.promise
          }
        )
        .then(
          function () {
            return server.assertLogs(t, {
              'auth-failure': 1
            })
          }
        )
    }
  )

  test(
    'HAWK nonce re-use',
    function (t) {
      var email = email1
      var password = 'allyourbasearebelongtous'
      var url = null
      return Client.login(config.publicUrl, email, password)
        .then(
          function (c) {
            url = c.api.baseURL + '/account/devices'
            return c.api.Token.SessionToken.fromHex(c.sessionToken)
          }
        )
        .then(
          function (token) {
            var d = P.defer()
            var hawk = require('hawk')
            var request = require('request')
            var method = 'GET'
            var verify = {
              credentials: token,
              nonce: 'abcdef'
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
                if (err) {
                  d.reject(err)
                } else {
                  t.equal(res.statusCode, 200, 'fresh nonce is accepted')
                  d.resolve(token)
                }
              }
            )
            return d.promise
          }
        )
        .then(
          function (token) {
            var d = P.defer()
            var hawk = require('hawk')
            var request = require('request')
            var method = 'GET'
            var verify = {
              credentials: token,
              nonce: 'abcdef'
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
                if (err) {
                  d.reject(err)
                } else {
                  t.equal(res.statusCode, 401, 'duplicate nonce is rejected')
                  t.equal(body.errno, 115, 'duplicate nonce is rejected')
                  d.resolve()
                }
              }
            )
            return d.promise
          }
        )
        .then(
          function () {
            return server.assertLogs(t, {
              'auth-failure': 1
            })
          }
        )
    }
  )

  test(
    'timestamp header',
    function (t) {
      var email = email1
      var password = 'allyourbasearebelongtous'
      var url = null
      return Client.login(config.publicUrl, email, password)
        .then(
          function (c) {
            url = c.api.baseURL + '/account/keys'
            return c.api.Token.KeyFetchToken.fromHex(c.keyFetchToken)
          }
        )
        .then(
          function (token) {
            var d = P.defer()
            var hawk = require('hawk')
            var request = require('request')
            var method = 'GET'
            var verify = {
              credentials: token,
              timestamp: Math.floor(Date.now() / 1000)
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
                if (err) {
                  d.reject(err)
                } else {
                  var now = +new Date() / 1000
                  t.ok(res.headers.timestamp > now - 5, 'has timestamp header')
                  t.ok(res.headers.timestamp < now + 5, 'has timestamp header')
                  d.resolve()
                }
              }
            )
            return d.promise
          }
        )
    }
  )

  test(
    'client adjusts to time skew',
    function (t) {
      var email = email1
      var password = 'allyourbasearebelongtous'
      var client
      return Client.login(config.publicUrl, email, password)
        .then(
          function (c) {
            client = c
            c.api.timeOffset = 61000;
            return c.keys();
          }
        )
        .then(
          function (keys) {
            t.fail("client should have invalid timestamp")
          },
          function (err) {
            t.equal(err.errno, 111, 'invalid timestamp')
            return client.keys();
          }
        )
        .then(
          function (keys) {
            t.ok(keys, 'client readjust to timestamp')
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
