/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test
var TestServer = require('../test_server')
var ReputationServerStub = require('../test_reputation_server')
var Promise = require('bluebird')
var restify = require('restify')
var mcHelper = require('../memcache-helper')

var TEST_EMAIL = 'test@example.com'
var TEST_IP = '192.0.2.1'
var TEST_BAD_IP = '9.9.9.9'
var ALLOWED_IP = '192.0.3.1'
var TEST_CHECK_ACTION = 'recoveryEmailVerifyCode'
const ENDPOINTS = [ '/check', '/checkIpOnly' ]

// wait for the violation to be sent for endpoints that respond
// before sending violation
var TEST_DELAY_MS = 500

var config = {
  listen: {
    port: 7000
  },
  limits: {
    rateLimitIntervalSeconds: 1
  },
  reputationService: {
    enable: true,
    enableCheck: true,
    blockBelow: 50,
    suspectBelow: 60,
    baseUrl: 'http://127.0.0.1:9009',
    timeout: 25
  }
}

// Override limit values for testing
process.env.ALLOWED_IPS = ALLOWED_IP

// Enable reputation test server
process.env.REPUTATION_SERVICE_ENABLE = config.reputationService.enable
process.env.REPUTATION_SERVICE_BASE_URL = config.reputationService.baseUrl
process.env.REPUTATION_SERVICE_TIMEOUT = config.reputationService.timeout
process.env.REPUTATION_SERVICE_ENABLE_CHECK = config.reputationService.enableCheck
process.env.REPUTATION_SERVICE_BLOCK_BELOW = config.reputationService.blockBelow
process.env.REPUTATION_SERVICE_SUSPECT_BELOW = config.reputationService.suspectBelow

var testServer = new TestServer(config)

var client = restify.createJsonClient({
  url: 'http://127.0.0.1:' + config.listen.port
})

Promise.promisifyAll(client, { multiArgs: true })

test(
  'startup test server',
  function (t) {
    testServer.start(function (err) {
      t.type(testServer.server, 'object', 'test server was started')
      t.notOk(err, 'no errors were returned')
      t.end()
    })
  }
)

ENDPOINTS.forEach(endpoint => {
  const  reputationServer = new ReputationServerStub(config)
  const reputationClient = restify.createJsonClient({
    url: config.reputationService.baseUrl
  })
  Promise.promisifyAll(reputationClient, { multiArgs: true })

  test('startup reputation service', t => {
    reputationServer.start(function (err) {
      t.type(reputationServer.server, 'object', 'test server was started')
      t.notOk(err, 'no errors were returned')
      t.end()
    })
  })

  test('clear everything', t => {
    mcHelper.clearEverything(
      function (err) {
        t.notOk(err, 'no errors were returned')
        t.end()
      }
    )
  })

  test(`does not block ${endpoint} for IP with nonexistent reputation`, t => {
    return reputationClient.delAsync('/' + TEST_IP)
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'clears reputation for TEST_IP')
        return client.postAsync(endpoint, { email: TEST_EMAIL, ip: TEST_IP, action: TEST_CHECK_ACTION })
      }).spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200')
        t.equal(obj.block, false, 'action not blocked')
        t.end()
      }).catch(function(err) {
        t.fail(err)
        t.end()
      })
  })

  test(`does not block ${endpoint} for IP with reputation above blockBelow`, t => {
    return reputationClient.delAsync('/' + TEST_IP)
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'clears reputation for TEST_IP')
        return reputationClient.postAsync('/', {ip: TEST_IP, reputation: 60})
      }).spread(function (req, res, obj) {
        t.equal(res.statusCode, 201, 'sets reputation for TEST_IP')
        return client.postAsync(endpoint, { email: TEST_EMAIL, ip: TEST_IP, action: TEST_CHECK_ACTION })
      }).spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200')
        t.equal(obj.block, false, 'action not blocked')
        t.end()
      }).catch(function(err) {
        t.fail(err)
        t.end()
      })
  })

  test(`suspects ${endpoint} for IP with reputation below suspectBelow`, t => {
    return reputationClient.delAsync('/' + TEST_IP)
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'clears reputation for TEST_IP')
        return reputationClient.postAsync('/', {ip: TEST_IP, reputation: 55})
      }).spread(function (req, res, obj) {
        t.equal(res.statusCode, 201, 'sets reputation for TEST_IP')
        return client.postAsync(endpoint, { email: TEST_EMAIL, ip: TEST_IP, action: TEST_CHECK_ACTION })
      }).spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200')
        t.equal(obj.suspect, true, 'action suspected')
        t.equal(obj.block, false, 'action not blocked')
        t.end()
      }).catch(function(err) {
        t.fail(err)
        t.end()
      })
  })

  test(`blocks ${endpoint} for IP with reputation below blockBelow`, t => {
    return reputationClient.delAsync('/' + TEST_IP)
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'clears reputation for TEST_IP')
        return reputationClient.postAsync('/', {ip: TEST_IP, reputation: 10})
      }).spread(function (req, res, obj) {
        t.equal(res.statusCode, 201, 'sets reputation for TEST_IP')
        return client.postAsync(endpoint, { email: TEST_EMAIL, ip: TEST_IP, action: TEST_CHECK_ACTION })
      }).spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200')
        t.equal(obj.block, true, 'action blocked')
        t.equal(obj.blockReason, undefined, 'block reason not returned')
        return Promise.delay(TEST_DELAY_MS)
      }).then(function () {
        return reputationClient.getAsync('/mostRecentViolation/' + TEST_IP)
      }).spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200')
        t.strictDeepEqual(obj, {}, 'no violations sent')
        t.end()
      }).catch(function(err) {
        t.fail(err)
        t.end()
      })
  })

  test(`does not block ${endpoint} for whitelisted IP with reputation below blockBelow`, t => {
    return reputationClient.delAsync('/' + ALLOWED_IP)
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'clears reputation for ALLOWED_IP')
        return reputationClient.postAsync('/', {ip: ALLOWED_IP, reputation: 10})
      }).spread(function (req, res, obj) {
        t.equal(res.statusCode, 201, 'sets reputation for ALLOWED_IP')
        return client.postAsync(endpoint, { email: TEST_EMAIL, ip: ALLOWED_IP, action: TEST_CHECK_ACTION })
      }).spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200')
        t.equal(obj.block, false, 'action not blocked')
        t.end()
      }).catch(function(err) {
        t.fail(err)
        t.end()
      })
  })

  test(`${endpoint} returns when GET IP reputation service returns an bad response`, t => {
    return client.postAsync(endpoint, { email: TEST_EMAIL, ip: TEST_BAD_IP, action: TEST_CHECK_ACTION })
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200')
        t.equal(obj.block, false, 'action not blocked')
        t.end()
      }).catch(function(err) {
        t.fail(err)
        t.end()
      })
  })

  test('teardown test reputation server', t => {
    reputationServer.stop()
    t.equal(reputationServer.server.killed, true, 'test reputation server killed')
    t.end()
  })

  test(`${endpoint} returns when GET IP reputation times out`, t => {
    return client.postAsync(endpoint, { email: TEST_EMAIL, ip: TEST_IP, action: TEST_CHECK_ACTION })
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200')
        t.equal(obj.block, false, 'action not blocked')
        t.end()
      }).catch(function(err) {
        t.fail(err)
        t.end()
      })
  })
})

test(
  'teardown test server',
  function (t) {
    testServer.stop()
    t.equal(testServer.server.killed, true, 'test server killed')
    t.end()
  }
)
