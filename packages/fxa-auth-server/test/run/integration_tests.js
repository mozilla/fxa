/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var crypto = require('crypto')
var Client = require('../../client')
var TestServer = require('../test_server')
var P = require('p-promise')
var config = require('../../config').root()

function uniqueID() {
  return crypto.randomBytes(10).toString('hex');
}

TestServer.start(config.public_url)
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
      return Client.create(config.public_url, email, password, { preVerified: true })
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
      return Client.create(config.public_url, email, password, { preVerified: true })
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
            t.deepEqual(keys.wrapKb, wrapKb, 'wrapKb is preserved')
            t.equal(client.kB.length, 32, 'kB exists, has the right length')
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
      return Client.login(config.public_url, email, password)
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
    }
  )

  test(
    'account destroy',
    function (t) {
      var email = email3
      var password = 'allyourbasearebelongtous'
      var client = null
      return Client.create(config.public_url, email, password, { preVerified: true })
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
    }
  )

  test(
    'session destroy',
    function (t) {
      var email = email4
      var password = 'foobar'
      var client = null
      var sessionToken = null
      return Client.create(config.public_url, email, password, { preVerified: true })
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
    }
  )

  test(
    'Unknown account should not exist',
    function (t) {
      var email = email5
      var client = new Client(config.public_url)
      return client.accountExists(email)
        .then(
          function (exists) {
            t.equal(exists, false, "account shouldn't exist")
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
      return Client.create(config.public_url, email, password, { preVerified: true })
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
        ).then(
          function () {
            t.ok(client.sessionToken, "client can login after accountExists")
          }
        )
    }
  )

  test(
    'random bytes',
    function (t) {
      var client = new Client(config.public_url)
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
      var client = new Client(config.public_url)
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
      return Client.login(config.public_url, email, password)
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
    }
  )

  test(
    'HAWK nonce re-use',
    function (t) {
      var email = email1
      var password = 'allyourbasearebelongtous'
      var url = null
      return Client.login(config.public_url, email, password)
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
    }
  )

  test(
    'timestamp header',
    function (t) {
      var email = email1
      var password = 'allyourbasearebelongtous'
      var url = null
      return Client.login(config.public_url, email, password)
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
    'credentials are set up correctly with keystretching and srp',
    function (t) {
      var salt = '00f000000000000000000000000000000000000000000000000000000000034d'
      var srpSalt = '00f1000000000000000000000000000000000000000000000000000000000179';
      var email = 'andré@example.org'
      var password = Buffer('pässwörd')
      var client = new Client(config.public_url)
      return client.setupCredentials(
          email, password, salt, srpSalt
        )
        .then(
          function () {
            t.equal(client.srpPw, '00f9b71800ab5337d51177d8fbc682a3653fa6dae5b87628eeec43a18af59a9d')
            t.equal(client.unwrapBKey, '6ea660be9c89ec355397f89afb282ea0bf21095760c8c5009bbcc894155bbe2a')
            t.equal(client.srp.verifier, '00173ffa0263e63ccfd6791b8ee2a40f048ec94cd95aa8a3125726f9805e0c8283c658dc0b607fbb25db68e68e93f2658483049c68af7e8214c49fde2712a775b63e545160d64b00189a86708c69657da7a1678eda0cd79f86b8560ebdb1ffc221db360eab901d643a75bf1205070a5791230ae56466b8c3c1eb656e19b794f1ea0d2a077b3a755350208ea0118fec8c4b2ec344a05c66ae1449b32609ca7189451c259d65bd15b34d8729afdb5faff8af1f3437bbdc0c3d0b069a8ab2a959c90c5a43d42082c77490f3afcc10ef5648625c0605cdaace6c6fdc9e9a7e6635d619f50af7734522470502cab26a52a198f5b00a279858916507b0b4e9ef9524d6')
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
