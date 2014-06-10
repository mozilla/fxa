/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var TestServer = require('../test_server')
var path = require('path')
var Client = require('../client')

process.env.CONFIG_FILES = path.join(__dirname, '../config/base_path.json')
var config = require('../../config').root()

TestServer.start(config)
.then(function main(server) {

  test(
    'alternate base path',
    function (t) {
      var email = Math.random() + "@example.com"
      var password = 'ok'
      t.ok(true) // this silences log output. with no assertions tap dumps logs
      // if this doesn't crash, we're all good
      return Client.createAndVerify(config.publicUrl, email, password, server.mailbox)
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
