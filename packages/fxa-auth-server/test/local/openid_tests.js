/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var Pool = require('poolee')

process.env.OPENID_PROVIDERS = 'https://me.yahoo.com,https://openid.example.com'
var config = require('../../config').getProperties()

TestServer.start(config)
.then(function main(server) {

  test(
    'openid login rejects invalid assertions',
    function (t) {
      Pool.request(
        config.publicUrl + '/v1/account/openid/login?openid.claimed_id=https://me.yahoo.com/foo',
        function (err, res) {
          t.equal(res.statusCode, 400)
          t.end()
        }
      )
    }
  )

  // test(
  //   'openid login rejects valid assertions for non-allowed providers'
  // )


  test(
    'teardown',
    function (t) {
      server.stop()
      t.end()
    }
  )
})
