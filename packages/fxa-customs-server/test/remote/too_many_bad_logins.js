/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test
var restify = require('restify')
var TestServer = require('../test_server')
var mcHelper = require('../memcache-helper')

var TEST_EMAIL = 'test@example.com'
var TEST_IP = '192.0.2.1'

var config = {
  port: 7000,
  rateLimitIntervalSeconds: 1
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
  url: 'http://127.0.0.1:' + config.port
});

test(
  'too many failed logins',
  function (t) {
    client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: TEST_IP },
      function (err, req, res, obj) {
        t.equal(res.statusCode, 200, 'first login attempt noted')

        client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: TEST_IP },
          function (err, req, res, obj) {
            t.equal(res.statusCode, 200, 'second login attempt noted')

            client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: TEST_IP },
              function (err, req, res, obj) {
                t.equal(res.statusCode, 200, 'third login attempt noted')

                mcHelper.badLoginCheck(
                  function (isOverBadLogins) {
                    t.equal(isOverBadLogins, true, 'is now over bad logins')
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

test(
  'failed logins expire',
  function (t) {
    setTimeout(
      function () {
        mcHelper.badLoginCheck(
          function (isOverBadLogins) {
            t.equal(isOverBadLogins, false, 'is no longer over bad logins')
            t.end()
          }
        )
      },
      config.rateLimitIntervalSeconds * 1000
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
