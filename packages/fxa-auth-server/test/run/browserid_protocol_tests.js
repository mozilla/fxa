/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
// jshint -W069

var test = require('../ptaptest')
var cp = require('child_process')
var Client = require('../../client')

var config = require('../../config').root()

function main() {

  test(
    'fetch /.well-known/browserid support document',
    function (t) {
      var client = new Client(config.public_url)
      function fetch(url) {
        return client.api.doRequest('GET', config.public_url + url)
      }
      return fetch('/.well-known/browserid')
      .then(
        function (doc) {
          t.ok(doc.hasOwnProperty('public-key'), 'doc has public key')
          t.ok(doc.hasOwnProperty('authentication'), 'doc has auth page')
          t.ok(doc.hasOwnProperty('provisioning'), 'doc has provisioning page')
          return doc
        }
      )
      .then(
        function (doc) {
          return fetch(doc['authentication'])
          .then(
            function (authPage) {
              t.ok(authPage, 'auth page can be fetched')
              return doc
            }
          )
        }
      )
      .then(
        function (doc) {
          return fetch(doc['provisioning'])
          .then(
            function (provPage) {
              t.ok(provPage, 'provisioning page can be fetched')
              return doc
            }
          )
        }
      )
    }
  )

  test(
    'teardown',
    function (t) {
      if (server) server.kill('SIGINT')
      t.end()
    }
  )

}

///////////////////////////////////////////////////////////////////////////////

var server = null

function startServer() {
  var server = cp.spawn(
    'node',
    ['../../bin/key_server.js'],
    {
      cwd: __dirname
    }
  )

  server.stdout.on('data', process.stdout.write.bind(process.stdout))
  server.stderr.on('data', process.stderr.write.bind(process.stderr))
  return server
}

function waitLoop() {
  Client.Api.heartbeat(config.public_url)
    .done(
      main,
      function () {
        if (!server) {
          server = startServer()
        }
        console.log('waiting...')
        setTimeout(waitLoop, 100)
      }
    )
}

waitLoop()
