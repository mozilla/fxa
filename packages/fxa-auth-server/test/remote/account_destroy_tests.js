/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var path = require('path')
var Client = require('../../client')

process.env.CONFIG_FILES = path.join(__dirname, '../config/account_tests.json')
var config = require('../../config').root()

TestServer.start(config)
.then(function main(server) {

  test(
    'account destroy',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'allyourbasearebelongtous'
      var client = null
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (x) {
            client = x
            return client.devices()
          }
        )
        .then(
          function (devices) {
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
    'invalid authPW on account destroy',
    function (t) {
      var email = server.uniqueEmail()
      var password = 'ok'
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
        .then(
          function (c) {
            c.authPW = Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex')
            return c.destroyAccount()
          }
        )
        .then(
          t.fail,
          function (err) {
            t.equal(err.errno, 103)
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
