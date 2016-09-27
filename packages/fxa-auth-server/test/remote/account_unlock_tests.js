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
    '/account/lock is no longer supported',
    function (t) {
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password')
        .then(
          function (c) {
            return c.lockAccount()
          }
        )
        .then(
          function () {
            t.fail('should get an error')
          },
          function (e) {
            t.equal(e.code, 410, 'correct error status code')
          }
        )
    }
  )

  test(
    '/account/unlock/resend_code is no longer supported',
    function (t) {
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password')
        .then(
          function (c) {
            return c.resendAccountUnlockCode('en')
          }
        )
        .then(
          function () {
            t.fail('should get an error')
          },
          function (e) {
            t.equal(e.code, 410, 'correct error status code')
          }
        )
    }
  )

  test(
    '/account/unlock/verify_code is no longer supported',
    function (t) {
      return Client.create(config.publicUrl, server.uniqueEmail(), 'password')
        .then(
          function (c) {
            return c.verifyAccountUnlockCode('bigscaryuid', 'bigscarycode')
          }
        )
        .then(
          function () {
            t.fail('should get an error')
          },
          function (e) {
            t.equal(e.code, 410, 'correct error status code')
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
