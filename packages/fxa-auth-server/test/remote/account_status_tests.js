/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
const Client = require('../client')()

var config = require('../../config').getProperties()

TestServer.start(config)
.then(function main(server) {

  test(
    'account status with existing account',
    function (t) {
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password')
        .then(
          function (c) {
            return c.api.accountStatus(c.uid)
          }
        )
        .then(
          function (response) {
            t.ok(response.exists, 'account exists')
          }
        )
    }
  )

  test(
    'account status includes locale when authenticated',
    function (t) {
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(
          function (c) {
            return c.api.accountStatus(c.uid, c.sessionToken)
          }
        )
        .then(
          function (response) {
            t.equal(response.locale, 'en-US', 'locale is stored')
          }
        )
    }
  )

  test(
    'account status does not include locale when unauthenticated',
    function (t) {
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(
          function (c) {
            return c.api.accountStatus(c.uid)
          }
        )
        .then(
          function (response) {
            t.ok(!response.locale, 'locale is not present')
          }
        )
    }
  )

  test(
    'account status unauthenticated with no uid returns an error',
    function (t) {
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password', { lang: 'en-US' })
        .then(
          function (c) {
            return c.api.accountStatus()
          }
        )
        .then(
          function () {
            t.fail('should get an error')
          },
          function (e) {
            t.equal(e.code, 400, 'correct error status code')
            t.equal(e.errno, 108, 'correct errno')
          }
        )
    }
  )

  test(
    'account status with non-existing account',
    function (t) {
      var api = new Client.Api(config.publicUrl)
      return api.accountStatus('0123456789ABCDEF0123456789ABCDEF')
        .then(
          function (response) {
            t.ok(!response.exists, 'account does not exist')
          }
        )
    }
  )

  test(
    'account status by email with existing account',
    function (t) {
      var email = server.uniqueEmail()
      return Client.create(config.publicUrl, email, 'password')
        .then(
          function (c) {
            return c.api.accountStatusByEmail(email)
          }
        )
        .then(
          function (response) {
            t.ok(response.exists, 'account exists')
          }
        )
    }
  )

  test(
    'account status by email with non-existing account',
    function (t) {
      var email = server.uniqueEmail()
      return Client.create(config.publicUrl, email, 'password')
        .then(
          function (c) {
            var nonExistEmail = server.uniqueEmail()
            return c.api.accountStatusByEmail(nonExistEmail)
          }
        )
        .then(
          function (response) {
            t.ok(!response.exists, 'account does not exist')
          }
        )
    }
  )

  test(
    'account status by email with an invalid email',
    function (t) {
      var email = server.uniqueEmail()
      return Client.create(config.publicUrl, email, 'password')
        .then(
          function (c) {
            var invalidEmail = 'notAnEmail'
            return c.api.accountStatusByEmail(invalidEmail)
          }
        )
        .then(
          function () {
            t.fail('should not have successful request')
          },
          function (err) {
            t.equal(err.code, 400)
            t.equal(err.errno, 107)
            t.equal(err.message, 'Invalid parameter in request body')
          }
        )
    }
  )

  test(
    'account status by email works with unicode email address',
    function (t) {
      var email = server.uniqueUnicodeEmail()
      return Client.create(config.publicUrl, email, 'password')
        .then(
          function (c) {
            return c.api.accountStatusByEmail(email)
          }
        )
        .then(
          function (response) {
            t.ok(response.exists, 'account exists')
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
