/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var fs = require('fs')
var path = require('path')
var test = require('../ptaptest')
var TestServer = require('../test_server')
var Client = require('../client')
var jws = require('jws')
var jwcrypto = require('jwcrypto')
require('jwcrypto/lib/algs/rs')
var b64 = require('jwcrypto/lib/utils').base64urlencode

process.env.CONFIG_FILES = path.join(__dirname, '../config/preverify_secret.json')
var config = require('../../config').root()
var secretKey = jwcrypto.loadSecretKey(fs.readFileSync(config.secretKeyFile))
function fail() { throw new Error('call succeeded when it should have failed')}

TestServer.start(config)
.then(function main(server) {

  test(
    'a valid preVerifyToken creates a verified account',
    function (t) {
      var email = Math.random() + "@example.com"
      var password = 'ok'
      var header = b64(JSON.stringify(
        {
          alg: 'RS256',
          jku: config.publicUrl + '/.well-known/public-keys',
          kid: 'dev-1'
        }
      ))
      var payload = b64(JSON.stringify(
        {
          iss: config.trustedIssuers[0],
          exp: Date.now() + 10000,
          aud: config.domain,
          sub: email
        }
      ))
      var sig = secretKey.sign(header + '.' + payload)
      var token = header + '.' + payload + '.' + sig
      console.error(token)
      return Client.create(config.publicUrl, email, password, { preVerifyToken: token })
        .then(
          function (c) {
            return c.keys()
          }
        )
        .then(
          function (keys) {
            t.ok(Buffer.isBuffer(keys.kA), 'kA exists')
            t.ok(Buffer.isBuffer(keys.wrapKb), 'wrapKb exists')
          }
        )
    }
  )

  test(
    'an invalid preVerifyToken return an invalid verification code error',
    function (t) {
      var email = Math.random() + "@example.com"
      var password = 'ok'
      var header = b64(JSON.stringify(
        {
          alg: 'RS256',
          jku: config.publicUrl + '/.well-known/public-keys',
          kid: 'dev-1'
        }
      ))
      var payload = b64(JSON.stringify(
        {
          iss: config.trustedIssuers[0],
          exp: Date.now() + 10000,
          aud: config.domain,
          sub: 'wrong@example.com'
        }
      ))
      var sig = secretKey.sign(header + '.' + payload)
      var token = header + '.' + payload + '.' + sig
      return Client.create(config.publicUrl, email, password, { preVerifyToken: token })
        .then(
          fail,
          function (err) {
            t.equal(err.errno, 105, 'invalid verification code')
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
