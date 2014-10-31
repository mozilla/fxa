/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test
var TestServer = require('../test_server')
var pkg = require('../../package.json')
var clientThen = require('../client-then')

var cfg = {
  port: 8000
}
var testServer = new TestServer(cfg)
var client = clientThen({ url : 'http://127.0.0.1:' + cfg.port })

test(
  'startup',
  function (t) {
    testServer.start(function (err) {
      t.type(testServer.server, 'object', 'test server was started')
      t.equal(err, null, 'no errors were returned')
      t.end()
    })
  }
)

test(
  'top level info',
  function (t) {
    client.getThen('/')
      .then(function(r) {
        t.equal(r.res.statusCode, 200, 'returns a 200')
        t.equal(r.obj.version, pkg.version, 'Version reported is the same a package.json')
        t.deepEqual(r.obj, { version : pkg.version }, 'Object contains no other fields')
        t.end()
      })
  }
)

test(
  'heartbeat',
  function (t) {
    client.getThen('/__heartbeat__')
      .then(function (r) {
        t.deepEqual(r.obj, {}, 'Heartbeat contains an empty object and nothing unexpected')
        t.end()
      })
  }
)

test(
  'teardown',
  function (t) {
    testServer.stop()
    t.equal(testServer.server.killed, true, 'test server has been killed')
    t.end()
  }
)
