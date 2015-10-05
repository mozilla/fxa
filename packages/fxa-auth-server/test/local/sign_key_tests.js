/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var P = require('../../lib/promise')
var request = require('request')
var path = require('path')

process.env.OLD_PUBLIC_KEY_FILE = path.resolve(__dirname, '../../config/public-key.json')
var config = require('../../config').getProperties()

TestServer.start(config)
.then(function main(server) {

  test(
    '.well-known/browserid has keys',
    function (t) {
      var d = P.defer()
      request('http://127.0.0.1:9000/.well-known/browserid',
        function (err, res, body) {
          if (err) { d.reject(err) }
          t.equal(res.statusCode, 200)
          var json = JSON.parse(body)
          t.equal(json.authentication, '/.well-known/browserid/sign_in.html')
          t.equal(json.keys.length, 2)
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
