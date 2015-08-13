/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var Client = require('../client')
var P = require('../../lib/promise')
var request = require('request')

process.env.PUBLIC_URL = 'http://127.0.0.1:9000/auth'
var config = require('../../config').root()

TestServer.start(config)
.then(function main(server) {

  function testVersionRoute(path) {
    return function (t) {
      var d = P.defer()
      request(config.publicUrl + path,
        function (err, res, body) {
          if (err) { d.reject(err) }
          t.equal(res.statusCode, 200)
          var json = JSON.parse(body)
          t.deepEqual(Object.keys(json), ['version', 'commit', 'source'])
          t.equal(json.version, require('../../package.json').version, 'package version')
          t.ok(json.source && json.source !== 'unknown', 'source repository')

          // check that the git hash just looks like a hash
          t.ok(json.commit.match(/^[0-9a-f]{40}$/), 'The git hash actually looks like one')
          d.resolve(json)
        }
      )
      return d.promise
    }
  }

  test(
    'alternate base path',
    function (t) {
      var email = Math.random() + '@example.com'
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
    '"/" returns valid version information',
    testVersionRoute('/')
  )

  test(
    '"/__version__" returns valid version information',
    testVersionRoute('/__version__')
  )

  test(
    'teardown',
    function (t) {
      server.stop()
      t.end()
    }
  )
})
