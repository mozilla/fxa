/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var path = require('path')
var Client = require('../client')
var P = require('../../promise')
var request = require('request')

process.env.CONFIG_FILES = path.join(__dirname, '../config/base_path.json')
var config = require('../../config').root()

TestServer.start(config)
.then(function main(server) {

  test(
    'alternate base path',
    function (t) {
      var email = Math.random() + "@example.com"
      var password = 'ok'
      // if this doesn't crash, we're all good
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
    }
  )

  test(
    '.well-known did not move',
    function (t) {
      var d = P.defer()
      request('http://127.0.0.1:9000/.well-known/browserid',
        function (err, res, body) {
          if (err) { d.reject(err) }
          t.equal(res.statusCode, 200)
          var json = JSON.parse(body)
          t.equal(json.authentication, '/.well-known/browserid/sign_in.html')
          d.resolve(json)
        }
      )
      return d.promise
    }
  )

  test(
    'default routes are prefixed',
    function (t) {
      var d = P.defer()
      request(config.publicUrl + '/',
        function (err, res, body) {
          if (err) { d.reject(err) }
          t.equal(res.statusCode, 200)
          var json = JSON.parse(body)
          t.deepEqual(Object.keys(json), ['version', 'commit'])
          d.resolve(json)
        }
      )
      return d.promise
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
