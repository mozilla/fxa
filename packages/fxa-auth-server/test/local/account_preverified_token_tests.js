/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var Client = require('../client')
var jws = require('jws')

var config = require('../../config').root()

TestServer.start(config)
.then(function main(server) {

  test(
    'a valid preVerifiedToken creates a verified account',
    function (t) {
      // FYI config.tokenLifetimes.passwordChangeToken = -1
      var email = Math.random() + "@example.com"
      var password = 'ok'
      var token = jws.sign({
        header: { alg: 'HS256' },
        payload: email,
        secret: config.preVerifySecret
      })
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
    'teardown',
    function (t) {
      server.stop()
      t.end()
    }
  )
})
