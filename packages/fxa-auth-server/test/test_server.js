/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var cp = require('child_process')
var crypto = require('crypto')
var P = require('../lib/promise')
var request = require('request')
var mailbox = require('./mailbox')
var createDBServer = require('fxa-auth-db-mysql')

let currentServer

/* eslint-disable no-console */
function TestServer(config, printLogs) {
  currentServer = this
  if (printLogs === undefined) {

    // Issue where debugger does not attach if
    // child process output is not piped to console
    if (isDebug()) {
      process.env.REMOTE_TEST_LOGS = 'true'
    }

    printLogs = (process.env.REMOTE_TEST_LOGS === 'true')
  }
  this.printLogs = printLogs
  this.config = config
  this.server = null
  this.mail = null
  this.oauth = null
  this.mailbox = mailbox(config.smtp.api.host, config.smtp.api.port, this.printLogs)
}

function waitLoop(testServer, url, cb) {
  request(
    url + '/__heartbeat__',
    function (err, res, body) {
      if (err) {
        if (err.errno !== 'ECONNREFUSED') {
          console.log('ERROR: unexpected result from ' + url)
          console.log(err)
          return cb(err)
        }
        if (! testServer.server) {
          if (testServer.printLogs) {
            console.log('starting...')
          }
          testServer.start()
        }
        if (testServer.printLogs) {
          console.log('waiting...')
        }
        return setTimeout(waitLoop.bind(null, testServer, url, cb), 100)
      } else if (res.statusCode !== 200) {
        cb(new Error(body))
      }
      cb()
    }
  )
}

function processKill(p, kid, signal) {
  return new P((resolve, reject) => {
    p.on('exit', (code, sig) => {
      resolve()
    })
    p.kill(signal)
  })
}

TestServer.start = function (config, printLogs) {
  var d = P.defer()
  TestServer.stop().then(() => {
    return createDBServer().then(
      function (db) {
        db.listen(config.httpdb.url.split(':')[2])
        db.on('error', function () {})
        var testServer = new TestServer(config, printLogs)
        testServer.db = db
        waitLoop(testServer, config.publicUrl, function (err) {
          return err ? d.reject(err) : d.resolve(testServer)
        })
      }
    )
  }).then(null, err => {
    d.reject(err)
  })
  return d.promise
}

function isDebug(){
  return global.v8debug ? true : false
}

TestServer.prototype.start = function () {
  var spawnOptions = ['./key_server_stub.js']

  var nextDebugPort = process.debugPort + 2
  if (isDebug()) {
    spawnOptions.unshift('--debug-brk=' + nextDebugPort)
  }

  this.server = cp.spawn(
    'node',
    spawnOptions,
    {
      cwd: __dirname,
      stdio: this.printLogs ? 'pipe' : 'ignore'
    }
  )

  if (this.printLogs) {
    this.server.stdout.on('data', process.stdout.write.bind(process.stdout))
    this.server.stderr.on('data', process.stderr.write.bind(process.stderr))
  }

  // if another instance is already running this will just die which is ok
  this.mail = cp.spawn(
    'node',
    ['./mail_helper.js'],
    {
      cwd: __dirname,
      stdio: this.printLogs ? 'pipe' : 'ignore'
    }
  )
  if (this.printLogs) {
    this.mail.stdout.on('data', process.stdout.write.bind(process.stdout))
    this.mail.stderr.on('data', process.stderr.write.bind(process.stderr))
  }
  if (this.config.oauth.url) {
    this.oauth = cp.spawn(
      'node',
      ['./oauth_helper.js'],
      {
        cwd: __dirname,
        stdio: this.printLogs ? 'pipe' : 'ignore'
      }
    )
    if (this.printLogs) {
      this.oauth.stdout.on('data', process.stdout.write.bind(process.stdout))
      this.oauth.stderr.on('data', process.stderr.write.bind(process.stderr))
    }
  }
}

TestServer.stop = function (maybeServer) {
  if (maybeServer) {
    return maybeServer.stop()
  } else if (currentServer) {
    return currentServer.stop()
  } else {
    return P.resolve()
  }
}

TestServer.prototype.stop = function () {
  currentServer = undefined
  try { this.db.close() } catch (e) {}
  if (this.server) {
    const doomed = [
      processKill(this.server, 'server', 'SIGINT'),
      processKill(this.mail, 'mail')
    ]
    if (this.oauth) {
      doomed.push(processKill(this.oauth, 'oauth'))
    }
    return P.all(doomed)
  } else {
    return P.resolve()
  }
}

TestServer.prototype.uniqueEmail = function () {
  return crypto.randomBytes(10).toString('hex') + '@restmail.net'
}

TestServer.prototype.uniqueUnicodeEmail = function () {
  return crypto.randomBytes(10).toString('hex') +
    String.fromCharCode(1234) +
    '@' +
    String.fromCharCode(5678) +
    'restmail.net'
}

module.exports = TestServer
