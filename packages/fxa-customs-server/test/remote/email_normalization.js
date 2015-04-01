/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test
var restify = require('restify')
var TestServer = require('../test_server')
var mcHelper = require('../memcache-helper')

var TEST_EMAIL = 'test@example.com'
var TEST_IP = '192.0.2.1'

var config = {
  listen: {
    port: 7000
  }
}

var testServer = new TestServer(config)

test(
  'startup',
  function (t) {
    testServer.start(function (err) {
      t.type(testServer.server, 'object', 'test server was started')
      t.notOk(err, 'no errors were returned')
      t.end()
    })
  }
)

test(
  'clear everything',
  function (t) {
    mcHelper.clearEverything(
      function (err) {
        t.notOk(err, 'no errors were returned')
        t.end()
      }
    )
  }
)

var client = restify.createJsonClient({
  url: 'http://127.0.0.1:' + config.listen.port
});

test(
  'too many failed logins using different capitalizations',
  function (t) {
    client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: TEST_IP },
      function (err, req, res, obj) {
        t.equal(res.statusCode, 200, 'first login attempt noted')
        t.ok(obj, 'got an obj, make jshint happy')

        client.post('/failedLoginAttempt', { email: 'TEST@example.com', ip: TEST_IP },
          function (err, req, res, obj) {
            t.equal(res.statusCode, 200, 'second login attempt noted')
            t.ok(obj, 'got an obj, make jshint happy')

            client.post('/failedLoginAttempt', { email: 'test@Example.Com', ip: TEST_IP },
              function (err, req, res, obj) {
                t.equal(res.statusCode, 200, 'third login attempt noted')
                t.ok(obj, 'got an obj, make jshint happy')

                client.post('/check', { email: TEST_EMAIL, ip: TEST_IP, action: 'accountLogin' },
                  function (err, req, res, obj) {
                    t.equal(res.statusCode, 200, 'login check succeeds')
                    t.equal(obj.block, true, 'login with exact email address is blocked')

                    client.post('/check', { email: 'tEST@eXaMpLe.CoM', ip: TEST_IP, action: 'accountLogin' },
                      function (err, req, res, obj) {
                        t.equal(res.statusCode, 200, 'login check succeeds')
                        t.equal(obj.block, true, 'login with weird caps is blocked')
                        t.end()
                      }
                    )
                  }
                )
              }
            )
          }
        )
      }
    )
  }
)

test(
  'failed logins are cleared',
  function (t) {
    client.post('/passwordReset', { email: 'tEst@example.com' },
      function (err, req, res, obj) {
        t.notOk(err, 'request is successful')
        t.equal(res.statusCode, 200, 'request returns a 200')
        t.ok(obj, 'got an obj, make jshint happy')

        client.post('/check', { email: TEST_EMAIL, ip: TEST_IP, action: 'accountLogin' },
          function (err, req, res, obj) {
            t.equal(res.statusCode, 200, 'login check succeeds')
            t.equal(obj.block, false, 'login is no longer blocked')
            t.end()
          }
        )
      }
    )
  }
)

test(
  'blocking an email using weird caps',
  function (t) {
    client.post('/blockEmail', { email: 'test@EXAMPLE.COM' },
      function (err, req, res, obj) {
        t.notOk(err, 'block request is successful')
        t.equal(res.statusCode, 200, 'block request returns a 200')
        t.ok(obj, 'got an obj, make jshint happy')

        client.post('/check', { email: TEST_EMAIL, ip: TEST_IP, action: 'accountCreate' },
          function (err, req, res, obj) {
            t.equal(res.statusCode, 200, 'check worked')
            t.equal(obj.block, true, 'request was blocked')
            t.end()
          }
        )
      }
    )
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
