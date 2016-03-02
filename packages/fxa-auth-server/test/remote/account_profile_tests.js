/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var path = require('path')
var test = require('../ptaptest')
var TestServer = require('../test_server')
var Client = require('../client')

process.env.CONFIG_FILES = path.join(__dirname, '../config/mock_oauth.json')
var config = require('../../config').root()

function makeMockOAuthHeader(opts) {
  var token = new Buffer(JSON.stringify(opts)).toString('hex')
  return 'Bearer ' + token
}

TestServer.start(config)
.then(function main(server) {

  test(
    'account profile authenticated with session returns profile data',
    function (t) {
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(
          function (c) {
            return c.api.accountProfile(c.sessionToken)
          }
        )
        .then(
          function (response) {
            t.ok(response.email, 'email address is returned')
            t.equal(response.locale, 'en-US', 'locale is returned')
          }
        )
    }
  )

  test(
    'account profile authenticated with oauth returns profile data',
    function (t) {
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(
          function (c) {
            return c.api.accountProfile(null, {
              Authorization: makeMockOAuthHeader({
                user: c.uid,
                scope: ['profile']
              })
            })
          }
        )
        .then(
          function (response) {
            t.ok(response.email, 'email address is returned')
            t.equal(response.locale, 'en-US', 'locale is returned')
          }
        )
    }
  )

  test(
    'account profile authenticated with invalid oauth token returns an error',
    function (t) {
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(
          function (c) {
            return c.api.accountProfile(null, {
              Authorization: makeMockOAuthHeader({
                code: 401,
                errno: 108
              })
            })
          }
        )
        .then(
          function () {
            t.fail('should get an error')
          },
          function (e) {
            t.equal(e.code, 401, 'correct error status code')
            t.equal(e.errno, 110, 'correct errno')
          }
        )
    }
  )

  test(
    'account status authenticated with oauth for unknown uid returns an error',
    function (t) {
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(
          function (c) {
            var UNKNOWN_UID = 'abcdef123456'
            t.notEqual(c.uid, UNKNOWN_UID)
            return c.api.accountProfile(null, {
              Authorization: makeMockOAuthHeader({
                user: UNKNOWN_UID,
                scope: ['profile']
              })
            })
          }
        )
        .then(
          function () {
            t.fail('should get an error')
          },
          function (e) {
            t.equal(e.code, 400, 'correct error status code')
            t.equal(e.errno, 102, 'correct errno')
          }
        )
    }
  )

  test(
    'account status authenticated with oauth for wrong scope returns no info',
    function (t) {
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(
          function (c) {
            return c.api.accountProfile(null, {
              Authorization: makeMockOAuthHeader({
                user: c.uid,
                scope: ['readinglist', 'payments']
              })
            })
          }
        )
        .then(
          function (response) {
            t.deepEqual(response, {}, 'no info should be returned')
          }
        )
    }
  )

  test(
    'account profile authenticated with limited oauth scopes returns limited profile data',
    function (t) {
      var client
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(
          function (c) {
            client = c
            return client.api.accountProfile(null, {
              Authorization: makeMockOAuthHeader({
                user: client.uid,
                scope: ['profile:email']
              })
            })
          }
        )
        .then(
          function (response) {
            t.ok(response.email, 'email address is returned')
            t.ok(!response.locale, 'locale should not be returned')
          }
        )
        .then(
          function () {
            return client.api.accountProfile(null, {
              Authorization: makeMockOAuthHeader({
                user: client.uid,
                scope: ['profile:locale']
              })
            })
          }
        )
        .then(
          function (response) {
            t.ok(!response.email, 'email address should not be returned')
            t.equal(response.locale, 'en-US', 'locale is returned')
          }
        )
    }
  )

  test(
    'account profile authenticated with oauth :write scopes returns profile data',
    function (t) {
      var client
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(
          function (c) {
            client = c
            return client.api.accountProfile(null, {
              Authorization: makeMockOAuthHeader({
                user: client.uid,
                scope: ['profile:write']
              })
            })
          }
        )
        .then(
          function (response) {
            t.ok(response.email, 'email address is returned')
            t.ok(response.locale, 'locale is returned')
          }
        )
        .then(
          function () {
            return client.api.accountProfile(null, {
              Authorization: makeMockOAuthHeader({
                user: client.uid,
                scope: ['profile:locale:write', 'readinglist']
              })
            })
          }
        )
        .then(
          function (response) {
            t.ok(!response.email, 'email address should not be returned')
            t.ok(response.locale, 'locale is returned')
          }
        )
        .then(
          function () {
            return client.api.accountProfile(null, {
              Authorization: makeMockOAuthHeader({
                user: client.uid,
                scope: ['storage', 'profile:email:write']
              })
            })
          }
        )
        .then(
          function (response) {
            t.ok(response.email, 'email address is returned')
            t.ok(!response.locale, 'locale should not be returned')
          }
        )
    }
  )

  test(
    'account profile works with unicode email address',
    function (t) {
      var email = server.uniqueUnicodeEmail()
      return Client.create(config.publicUrl, email, 'password')
        .then(
          function (c) {
            return c.api.accountProfile(c.sessionToken)
          }
        )
        .then(
          function (response) {
            t.equal(response.email, email, 'email address is returned')
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
