/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var cp = require('child_process')
var request = require('request')

function TestServer(config) {
  this.url = 'http://127.0.0.1:' + config.port
  this.server = null
}

function waitLoop(testServer, url, cb) {
  request(
    url + '/',
    function (err, res, body) {
      if (err) {
        if (err.errno !== 'ECONNREFUSED') {
          console.log('ERROR: unexpected result from ' + url)
          console.log(err)
          return cb(err)
        }
        return setTimeout(waitLoop.bind(null, testServer, url, cb), 100)
      }
      if (res.statusCode !== 200) {
        console.log('ERROR: bad status code: ' + res.statusCode)
        return cb(res.statusCode)
      }
      return cb()
    }
  )
}

TestServer.prototype.start = function (cb) {
  if (!this.server) {
    this.server = cp.spawn(
      'node',
      ['./db_server_stub'],
      {
        cwd: __dirname,
        stdio: 'ignore'
      }
    )
  }

  waitLoop(this, this.url, function (err) {
    if (err) {
      cb(err)
    } else {
      cb(null)
    }
  })
}

TestServer.prototype.stop = function () {
  if (this.server) {
    this.server.kill('SIGINT')
  }
}

module.exports = TestServer
