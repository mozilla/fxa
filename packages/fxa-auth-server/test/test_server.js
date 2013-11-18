/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var cp = require('child_process')
var P = require('p-promise')
var request = require('request')

function TestServer() {
  this.server = cp.spawn(
    'node',
    ['../bin/key_server.js'],
    {
      cwd: __dirname
    }
  )
  this.server.stdout.on('data', process.stdout.write.bind(process.stdout))
  this.server.stderr.on('data', process.stderr.write.bind(process.stderr))
}

TestServer.server = { stop: function () {}, fake: true }

function waitLoop(url, cb) {
  request(
    url + '/__heartbeat__',
    function (err, res, body) {
      if (err) {
        if (err.errno !== 'ECONNREFUSED') {
          console.log("ERROR: unexpected result from " + url)
          console.log(err)
          return cb(err)
        }
        if (TestServer.server.fake) {
          console.log('starting...')
          TestServer.server = new TestServer()
        }
        console.log('waiting...')
        return setTimeout(waitLoop.bind(null, url, cb), 100)
      }
      cb()
    }
  )
}

TestServer.start = function (url) {
  var d = P.defer()
  waitLoop(url, function (err) {
    return err ? d.reject(err) : d.resolve(TestServer.server)
  })
  return d.promise
}

TestServer.prototype.stop = function () {
  this.server.kill('SIGINT')
}

module.exports = TestServer
