/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('tap').test
var TestServer = require('../test_server')
const Client = require('../client')()
var P = require('../../lib/promise')

var config = require('../../config').getProperties()

process.env.VERIFIER_VERSION = '1'

TestServer.start(config)
.then(function main(server) {

  test(
    'concurrent create requests',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'abcdef'
      // Two shall enter, only one shall survive!
      var r1 = Client.create(config.publicUrl, email, password, server.mailbox)
      var r2 = Client.create(config.publicUrl, email, password, server.mailbox)
      return P.all(
        [r1, r2]
      )
      .then(
        t.fail.bind(t, 'created both accounts'),
        function (err) {
          t.equal(err.errno, 101, 'account exists')
          // Note that P.all fails fast when one of the requests fails,
          // but we have to wait for *both* to complete before tearing
          // down the test infrastructure.  Bleh.
          if (!r1.isRejected()) {
            return r1
          } else {
            return r2
          }
        }
      ).then(
        function () {
          return server.mailbox.waitForEmail(email)
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
