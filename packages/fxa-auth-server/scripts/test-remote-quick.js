#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var path = require('path')
var spawn = require('child_process').spawn
var config = require('../config').root()
var TestServer = require('../test/test_server')

TestServer.start(config, false)
  .then(
  function (server) {
    var tap = spawn(
      path.join(path.dirname(__dirname), 'node_modules/.bin/tap'),
      ['test/remote'],
      { stdio: 'inherit' }
    )

    tap.on('close', function(code) {
        server.stop()
    })
  }
)

