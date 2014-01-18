/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var Client = require('../../client')
var TestServer = require('../test_server')
var config = require('../../config').root()
var jwcrypto = require('jwcrypto')

TestServer.start(config)
.then(function main(server) {

  var email1 = server.uniqueEmail()

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
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
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
            t.equal(client.emailVerified, true, 'email is verified')
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
    'Change password flow',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var newPassword = 'foobar'
      var kB = null
      var client = null
      var firstAuthPW
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
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
    'teardown',
    function (t) {
      server.stop()
      t.end()
    }
  )
})
