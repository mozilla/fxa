/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var cp = require('child_process')
var crypto = require('crypto')
var P = require('../promise')
var request = require('request')
var split = require('binary-split')
var through = require('through')
var mailbox = require('./mailbox')

function TestServer(config, printLogs) {
  this.printLogs = printLogs === false ? false : true
  this.server = null
  this.mail = null
  this.mailbox = mailbox(config.smtp.api.host, config.smtp.api.port)
  this.logs = {}
}

function waitLoop(testServer, url, cb) {
  request(
    url + '/__heartbeat__',
    function (err, res, body) {
      if (err) {
        if (err.errno !== 'ECONNREFUSED') {
          console.log("ERROR: unexpected result from " + url)
          console.log(err)
          return cb(err)
        }
        if (!testServer.server) {
          console.log('starting...')
          testServer.start()
        }
        console.log('waiting...')
        return setTimeout(waitLoop.bind(null, testServer, url, cb), 100)
      }
      cb()
    }
  )
}

TestServer.start = function (config, printLogs) {
  var d = P.defer()
  var testServer = new TestServer(config, printLogs)
  waitLoop(testServer, config.publicUrl, function (err) {
    return err ? d.reject(err) : d.resolve(testServer)
  })
  return d.promise
}

TestServer.prototype.start = function () {
  this.server = cp.spawn(
    'node',
    ['./key_server_stub.js'],
    {
      cwd: __dirname
    }
  )
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
  if (this.printLogs) {
    this.server.stdout.on('data', process.stdout.write.bind(process.stdout))
    this.server.stderr.on('data', process.stderr.write.bind(process.stderr))
  }

  // if another instance is already running this will just die which is ok
  this.mail = cp.spawn(
    'node',
    ['./mail_helper_stub.js'],
    {
      cwd: __dirname
    }
  )
  if (this.printLogs) {
    this.mail.stdout.on('data', process.stdout.write.bind(process.stdout))
    this.mail.stderr.on('data', process.stderr.write.bind(process.stderr))
  }
}

TestServer.prototype.assertLogs = function (t, spec) {
  if (!this.server) { return P() }
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

TestServer.prototype.stop = function () {
  if (this.server) {
    this.server.kill('SIGINT')
    this.mail.kill()
  }
}

TestServer.prototype.uniqueEmail = function () {
  return crypto.randomBytes(10).toString('hex') + '@restmail.net'
}

module.exports = TestServer
