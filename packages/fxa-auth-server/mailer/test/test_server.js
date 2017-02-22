/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*eslint no-console: 0*/

var P = require('../lib/promise')
var request = require('request')
var createDBServer = require('fxa-auth-db-mysql')

function TestServer(config) {
  this.config = config
  this.server = null
}

function waitLoop(testServer, url, cb) {
  request(
    url,
    function (err) {
      if (err) {
        if (err.errno !== 'ECONNREFUSED') {
          console.log('ERROR: unexpected result from ' + url)
          console.log(err)
          return cb(err)
        }
        if (! testServer.server) {
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
  createDBServer().then(
    function (db) {
      console.log('Started DB server on', config.httpdb.url)
      db.listen(config.httpdb.url.split(':')[2])
      db.on('error', function () {})
      var testServer = new TestServer(config)
      testServer.db = db
      waitLoop(testServer, config.httpdb.url, function (err) {
        return err ? d.reject(err) : d.resolve(testServer)
      })
    }
  )
  return d.promise
}


TestServer.prototype.stop = function () {
  try { this.db.close() } catch (e) {}
}

module.exports = TestServer
