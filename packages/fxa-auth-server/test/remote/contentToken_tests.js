/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var Client = require('../client')
var test = require('../ptaptest')
var P = require('../../lib/promise')
var TestServer = require('../test_server')

process.env.CONTENT_TOKEN_REQUIRED = '1'
var config = require('../../config').getProperties()

TestServer.start(config)
.then(function main(server) {

  test(
    'requests without a contentToken are blocked by default',
    function (t) {
      // Make it a non-restmail.net address, since those get allowed by default
      var email = server.uniqueEmail() + '.com'
      var password = 'abcdef'
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (c) {
            return c.auth()
          }
        )
        .then(
          function () {
            t.fail('there should have been an error')
          },
          function (err) {
            t.equal(err.code, 400, 'status code')
            t.equal(err.errno, 125, 'errno')
          }
        )
    }
  )

  test(
    'contentToken default config allow firefox os devices',
    function (t) {
      // Make it a non-restmail.net address, since those get allowed by default
      var email = server.uniqueEmail() + '.com'
      var password = 'abcdef'
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (c) {
            c.api.defaultHeaders['user-agent'] = 'Mozilla/5.0 (TV; rv:44.0) Gecko/44.0 Firefox/44.0'
            return c.auth()
          }
        )
        .then(
          function () {
            t.ok('login should be allowed without content-token')
          }
        )
    }
  )

  test(
    'contentToken default config allows some specific partner devices',
    function (t) {
      return P.each([
        'Mozilla/5.0 (FreeBSD; Viera; rv:44.0) Gecko/20100101 Firefox/44.0',
        'Mozilla/5.0 (Linux; Android 5.0.1; SAMSUNG SM-N910F Build/LRX22C) AppleWebKit/537.36(KHTML, like Gecko) SamsungBrowser/3.0 Chrome/38.0.2125.102 Mobile Safari/537.36',
        'Firefox-Android-FxAccounts/45 (SBrowser)'
      ], function (userAgent) {
        // Make it a non-restmail.net address, since those get allowed by default
        var email = server.uniqueEmail() + '.com'
        var password = 'abcdef'
        return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
          .then(
            function (c) {
              c.api.defaultHeaders['user-agent'] = userAgent
              return c.auth()
            }
          )
          .then(
            function () {
              t.ok('login should be allowed without content-token')
            }
          )
      })
    }
  )

  test(
    'contentToken default config does not allow fennec UAs',
    function (t) {
      // Make it a non-restmail.net address, since those get allowed by default
      var email = server.uniqueEmail() + '.com'
      var password = 'abcdef'
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (c) {
            c.api.defaultHeaders['user-agent'] = 'Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0'
            return c.auth()
          }
        )
        .then(
          function () {
            t.fail('there should have been an error')
          },
          function (err) {
            t.equal(err.code, 400)
            t.equal(err.errno, 125)
          }
        )
    }
  )

  test(
    'contentToken default config allows restmail.net addresses',
    function (t) {
      // Make it a non-restmail.net address, since those get allowed by default
      var email = server.uniqueEmail()
      var password = 'abcdef'
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (c) {
            t.equal(email.lastIndexOf('@restmail.net'), email.length - 13)
            return c.auth()
          }
        )
        .then(
          function () {
            t.ok('login should be allowed without content-token')
          }
        )
    }
  )

  test(
    'teardown',
    function (t) {
      server.stop()
      delete process.env.CONTENT_TOKEN_REQUIRED
      t.end()
    }
  )
})
