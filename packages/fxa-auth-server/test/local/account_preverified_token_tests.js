/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var path = require('path')
var test = require('../ptaptest')
var TestServer = require('../test_server')
var Client = require('../client')
var jws = require('jws')

process.env.CONFIG_FILES = path.join(__dirname, '../config/preverify_secret.json')
var config = require('../../config').root()
function fail() { throw new Error('call succeeded when it should have failed')}

TestServer.start(config)
.then(function main(server) {

  test(
    'a valid preVerifyToken creates a verified account',
    function (t) {
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
    'an invalid preVerifyToken creates an unverified account',
    function (t) {
      var email = Math.random() + "@example.com"
      var password = 'ok'
      var token = jws.sign({
        header: { alg: 'HS256' },
        payload: 'nonmatching@example.com',
        secret: config.preVerifySecret
      })
      return Client.create(config.publicUrl, email, password, { preVerifyToken: token })
        .then(
          function (c) {
            return c.keys()
          }
        )
        .then(
          fail,
          function (err) {
            t.equal(err.errno, 104, 'unverified account')
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
