/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Override limit values for testing
process.env.MAX_BAD_LOGINS_PER_IP = 2
process.env.RATE_LIMIT_INTERVAL_SECONDS = 2

var test = require('tap').test
var TestServer = require('../test_server')
var Promise = require('bluebird')
var restify = Promise.promisifyAll(require('restify'))
var mcHelper = require('../memcache-helper')

var TEST_IP = '192.0.2.1'
var ACCOUNT_LOGIN = 'accountLogin'

var config = {
  listen: {
    port: 7000
  }
}

var testServer = new TestServer(config)

var client = restify.createJsonClient({
  url: 'http://127.0.0.1:' + config.listen.port
})

Promise.promisifyAll(client)

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

test(
  '/check `accountLogin` with different emails',
  function (t) {

    // Send requests until throttled
    return client.postAsync('/failedLoginAttempt', { ip: TEST_IP, email: 'test-fail1@example.com', action: ACCOUNT_LOGIN })
      .spread(function(req, res, obj){
        t.equal(res.statusCode, 200, 'failed login 1')
        t.equal(obj.lockout, false, 'not locked out')

        return client.postAsync('/failedLoginAttempt', { ip: TEST_IP, email: 'test-fail2@example.com', action: ACCOUNT_LOGIN })
      })
      .spread(function(req, res, obj){
        t.equal(res.statusCode, 200, 'failed login 2')
        t.equal(obj.lockout, false, 'not locked out')

        return client.postAsync('/check', { ip: TEST_IP, email: 'test1@example.com', action: ACCOUNT_LOGIN })
      })
      .spread(function(req, res, obj){
        t.equal(res.statusCode, 200, 'returns a 200')
        t.equal(obj.block, false, 'not rate limited')

        return client.postAsync('/failedLoginAttempt', { ip: TEST_IP, email: 'test-fail3@example.com', action: ACCOUNT_LOGIN })
      })
      .spread(function(req, res, obj){
        t.equal(res.statusCode, 200, 'failed login 3')
        t.equal(obj.lockout, false, 'not locked out')

        return client.postAsync('/check', { ip: TEST_IP, email: 'test2@example.com', action: ACCOUNT_LOGIN })
      })
      .spread(function(req, res, obj){
        t.equal(res.statusCode, 200, 'returns a 200')
        t.equal(obj.block, true, 'ip is now rate limited')
        t.equal(obj.retryAfter, 2, 'rate limit retry amount')

        return client.postAsync('/check', { ip: TEST_IP, email: 'test3@example.com', action: ACCOUNT_LOGIN })
      })
      // IP should be now blocked
      .spread(function(req, res, obj){
        t.equal(res.statusCode, 200, 'returns a 200')
        t.equal(obj.block, true, 'ip is now rate limited')

        // Delay ~2s for rate limit to go away
        return Promise.delay(3010)
      })
      // IP should be now unblocked
      .then(function(){
        return client.postAsync('/check', { ip: TEST_IP, email: 'test5@example.com', action: ACCOUNT_LOGIN })
      })
      .spread(function(req, res, obj){
        t.equal(res.statusCode, 200, 'returns a 200')
        t.equal(obj.block, false, 'is not rate limited after RATE_LIMIT_INTERVAL_SECONDS')
        t.end()
      })
      .catch(function(err){
        t.fail(err)
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
