/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var Client = require('../../client')
var jwcrypto = require('jwcrypto')
var config = require('../../config').root()

TestServer.start(config)
.then(function main(server) {

  test(
    'certificate sign',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null
      var publicKey = {
        "algorithm":"RS",
        "n":"4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123",
        "e":"65537"
      }
      var duration = 1000 * 60 * 60 * 24
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (c) {
            client = c
            return client.sign(publicKey, duration)
          }
        )
        .then(
          function (cert) {
            t.equal(typeof(cert), 'string', 'cert exists')
            var payload = jwcrypto.extractComponents(cert).payload
            t.equal(payload.principal.email.split('@')[0], client.uid, 'cert has correct uid')
            t.ok(payload['fxa-generation'] > 0, 'cert has non-zero generation number')
            t.ok(new Date() - new Date(payload['fxa-lastAuthAt'] * 1000) < 1000 * 60 * 60, 'lastAuthAt is plausible')
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
    '/certificate/sign inputs',
    function (t) {
      var email = server.uniqueEmail()
      var password = '123456'
      var client = null
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (c) {
            client = c
            // string as publicKey
            return client.sign("tada", 1000)
          }
        )
        .then(
          t.fail,
          function (err) {
            t.equal(err.code, 400, 'string as publicKey')
            // empty object as publicKey
            return client.sign({}, 1000)
          }
        )
        .then(
          t.fail,
          function (err) {
            t.equal(err.code, 400, 'empty object as publicKey')
            // invalid publicKey argument
            return client.sign({ algorithm: 'RS', n: 'x', e: 'y', invalid: true }, 1000)
          }
        )
        .then(
          t.fail,
          function (err) {
            t.equal(err.code, 400, 'invalid publicKey argument')
            // undefined duration
            return client.sign({ algorithm: 'RS', n: 'x', e: 'y' }, undefined)
          }
        )
        .then(
          t.fail,
          function (err) {
            t.equal(err.code, 400, 'undefined duration')
            // missing publicKey arguments (e)
            return client.sign({ algorithm: 'RS', n: 'x' }, 1000)
          }
        )
        .then(
          t.fail,
          function (err) {
            t.equal(err.code, 400, 'missing publicKey arguments (e)')
            // invalid algorithm
            return client.sign({ algorithm: 'NSA' }, 1000)
          }
        )
        .then(
          t.fail,
          function (err) {
            t.equal(err.code, 400, 'invalid algorithm')
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
