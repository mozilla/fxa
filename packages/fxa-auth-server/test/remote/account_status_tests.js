/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var Client = require('../client')

var config = require('../../config').root()

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
    'teardown',
    function (t) {
      server.stop()
      t.end()
    }
  )
})
