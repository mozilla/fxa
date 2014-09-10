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
  'maximum number of emails',
  function (t) {
    client.post('/check', { email: TEST_EMAIL, ip: TEST_IP, action: 'accountCreate' },
      function (err, req, res, obj) {
        t.equal(res.statusCode, 200, 'first email attempt')
        t.equal(obj.block, false, 'creating the account')

        client.post('/check', { email: TEST_EMAIL, ip: TEST_IP, action: 'recoveryEmailResendCode' },
          function (err, req, res, obj) {
            t.equal(res.statusCode, 200, 'second email attempt')
            t.equal(obj.block, false, 'resending the code')

            client.post('/check', { email: TEST_EMAIL, ip: TEST_IP, action: 'recoveryEmailResendCode' },
              function (err, req, res, obj) {
                t.equal(res.statusCode, 200, 'third email attempt')
                t.equal(obj.block, false, 'resending the code')

                mcHelper.blockedEmailCheck(
                  function (isBlocked) {
                    t.equal(isBlocked, false, 'account is still not blocked')
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
  'maximum failed logins',
  function (t) {
    client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: TEST_IP },
      function (err, req, res, obj) {
        t.equal(res.statusCode, 200, 'first login attempt noted')

        client.post('/failedLoginAttempt', { email: TEST_EMAIL, ip: TEST_IP },
          function (err, req, res, obj) {
            t.equal(res.statusCode, 200, 'second login attempt noted')

            mcHelper.badLoginCheck(
              function (isOverBadLogins, isWayOverBadLogins) {
                t.equal(isOverBadLogins, false, 'is still not over bad logins')
                t.equal(isWayOverBadLogins, false, 'is still not locked out')

                client.post('/check', { email: TEST_EMAIL, ip: TEST_IP, action: 'accountLogin' },
                  function (err, req, res, obj) {
                    t.equal(res.statusCode, 200, 'attempting to login')
                    t.equal(obj.block, false, 'login is not blocked')
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
  'teardown',
  function (t) {
    testServer.stop()
    t.equal(testServer.server.killed, true, 'test server has been killed')
    t.end()
  }
)
