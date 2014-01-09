/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var cp = require('child_process')
var P = require('../promise')
var request = require('request')
var split = require('binary-split')
var through = require('through')

function TestServer() {
  this.server = cp.spawn(
    'node',
    ['./key_server_stub.js'],
    {
      cwd: __dirname
    }
  )
  this.logs = {}
  this.server.stderr
    .pipe(split())
    .pipe(
      through(
        function (data) {
          try {
            this.emit('data', JSON.parse(data))
          }
          catch (e) {}
        }
      )
    )
    .on(
      'data',
      function (json) {
        var name = json.event ? json.event : json.op
        var count = this.logs[name] || 0
        this.logs[name] = ++count
      }.bind(this)
    )
  this.server.stdout.on('data', process.stdout.write.bind(process.stdout))
  this.server.stderr.on('data', process.stderr.write.bind(process.stderr))

  // if another instance is already running this will just die which is ok
  this.mail = cp.spawn(
    'node',
    ['./mail_helper_stub.js'],
    {
      cwd: __dirname
    }
  )
  this.mail.stdout.on('data', process.stdout.write.bind(process.stdout))
  this.mail.stderr.on('data', process.stderr.write.bind(process.stderr))
}

TestServer.server = { stop: function () {}, assertLogs: function () { return P() }, fake: true }

TestServer.prototype.assertLogs = function (t, spec) {
  var keys = Object.keys(spec)
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    var expected = spec[key]
    var actual = this.logs[key]
    if (!expected) {
      t.ok(!actual, 'no log output for ' + key)
    } else {
      t.equal(actual, expected, 'correct log output for ' + key)
    }
  }
  this.logs = {}
  return P()
}

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
  this.mail.kill()
}

module.exports = TestServer
