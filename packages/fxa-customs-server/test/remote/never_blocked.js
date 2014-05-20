/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var Memcached = require('memcached')
var test = require('tap').test
var restify = require('restify')
var TestServer = require('../test_server')

var TEST_EMAIL = 'test@example.com'
var TEST_IP = '192.0.2.1'

var config = {
  port: 7000,
  memcached: '127.0.0.1:11211',
  blockIntervalSeconds: 1,
  maxEmails: 3,
  maxBadLogins: 2
}

var EmailRecord = require('../../email_record')(config.blockIntervalSeconds * 1000, config.maxEmails)
var IpEmailRecord = require('../../ip_email_record')(config.blockIntervalSeconds * 1000, config.maxBadLogins)
var testServer = new TestServer(config)

var mc = new Memcached(
  config.memcached,
  {
    timeout: 500,
    retries: 1,
    retry: 1000,
    reconnect: 1000,
    idle: 30000,
    namespace: 'fxa~'
  }
)

function blockedCheck(cb) {
  setTimeout( // give memcache time to flush the writes
    function () {
      mc.get(TEST_EMAIL,
        function (err, data) {
          var er = EmailRecord.parse(data)
          mc.end()
          cb(er.isBlocked())
        }
      )
    }
  )
}

function badLoginCheck(cb) {
  setTimeout( // give memcache time to flush the writes
    function () {
      mc.get(TEST_IP + TEST_EMAIL,
        function (err, data) {
          var ier = IpEmailRecord.parse(data)
          mc.end()
          cb(ier.isOverBadLogins())
        }
      )
    }
  )
}

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

var client = restify.createJsonClient({
  url: 'http://127.0.0.1:' + config.port
});

test(
  'clear sent emails and bad logins',
  function (t) {
    mc.del(TEST_EMAIL,
      function (err) {
        t.equal(err, undefined, 'record deleted')
        blockedCheck(
          function (isBlocked) {
            t.equal(isBlocked, false, 'not blocked')

            mc.del(TEST_IP + TEST_EMAIL,
              function (err) {
                t.equal(err, undefined, 'record deleted')
                badLoginCheck(
                  function (isOverBadLogins) {
                    t.equal(isOverBadLogins, false, 'not over bad logins')
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

                blockedCheck(
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

            badLoginCheck(
              function (isOverBadLogins) {
                t.equal(isOverBadLogins, false, 'is still not over bad logins')

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
