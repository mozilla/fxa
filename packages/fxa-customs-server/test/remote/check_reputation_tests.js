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
    host: '127.0.0.1',
    port: 9009,
    timeout: 25
  }
}

// Override limit values for testing
process.env.ALLOWED_IPS = ALLOWED_IP

// Enable reputation test server
process.env.REPUTATION_SERVICE_ENABLE = config.reputationService.enable
process.env.REPUTATION_SERVICE_IP_ADDRESS = config.reputationService.host
process.env.REPUTATION_SERVICE_PORT = config.reputationService.port
process.env.REPUTATION_SERVICE_TIMEOUT = config.reputationService.timeout
process.env.REPUTATION_SERVICE_ENABLE_CHECK = config.reputationService.enableCheck
process.env.REPUTATION_SERVICE_BLOCK_BELOW = config.reputationService.blockBelow
process.env.REPUTATION_SERVICE_SUSPECT_BELOW = config.reputationService.suspectBelow

var testServer = new TestServer(config)
var reputationServer = new ReputationServerStub(config)

var client = restify.createJsonClient({
  url: 'http://127.0.0.1:' + config.listen.port
})
var reputationClient = restify.createJsonClient({
  url: 'http://' + config.reputationService.host + ':' + config.reputationService.port
})

Promise.promisifyAll(client, { multiArgs: true })
Promise.promisifyAll(reputationClient, { multiArgs: true })

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

test(
  'startup reputation service',
  function (t) {
    reputationServer.start(function (err) {
      t.type(reputationServer.server, 'object', 'test server was started')
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
  'does not block /check for IP with nonexistent reputation',
  function (t) {
    return reputationClient.delAsync('/' + TEST_IP)
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'clears reputation for TEST_IP')
        return client.postAsync('/check', { email: TEST_EMAIL, ip: TEST_IP, action: TEST_CHECK_ACTION })
      }).spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200')
        t.equal(obj.block, false, 'action not blocked')
        t.end()
      }).catch(function(err) {
        t.fail(err)
        t.end()
      })
  }
)

test(
  'does not block /check for IP with reputation above blockBelow',
  function (t) {
    return reputationClient.delAsync('/' + TEST_IP)
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'clears reputation for TEST_IP')
        return reputationClient.postAsync('/', {ip: TEST_IP, reputation: 60})
      }).spread(function (req, res, obj) {
        t.equal(res.statusCode, 201, 'sets reputation for TEST_IP')
        return client.postAsync('/check', { email: TEST_EMAIL, ip: TEST_IP, action: TEST_CHECK_ACTION })
      }).spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200')
        t.equal(obj.block, false, 'action not blocked')
        t.end()
      }).catch(function(err) {
        t.fail(err)
        t.end()
      })
  }
)

test(
  'suspects /check for IP with reputation below suspectBelow',
  function (t) {
    return reputationClient.delAsync('/' + TEST_IP)
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'clears reputation for TEST_IP')
        return reputationClient.postAsync('/', {ip: TEST_IP, reputation: 55})
      }).spread(function (req, res, obj) {
        t.equal(res.statusCode, 201, 'sets reputation for TEST_IP')
        return client.postAsync('/check', { email: TEST_EMAIL, ip: TEST_IP, action: TEST_CHECK_ACTION })
      }).spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200')
        t.equal(obj.suspect, true, 'action suspected')
        t.equal(obj.block, false, 'action not blocked')
        t.end()
      }).catch(function(err) {
        t.fail(err)
        t.end()
      })
  }
)

test(
  'blocks /check for IP with reputation below blockBelow',
  function (t) {
    return reputationClient.delAsync('/' + TEST_IP)
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'clears reputation for TEST_IP')
        return reputationClient.postAsync('/', {ip: TEST_IP, reputation: 10})
      }).spread(function (req, res, obj) {
        t.equal(res.statusCode, 201, 'sets reputation for TEST_IP')
        return client.postAsync('/check', { email: TEST_EMAIL, ip: TEST_IP, action: TEST_CHECK_ACTION })
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
  }
)

test(
  'does not block /check for whitelisted IP with reputation below blockBelow',
  function (t) {
    return reputationClient.delAsync('/' + ALLOWED_IP)
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'clears reputation for ALLOWED_IP')
        return reputationClient.postAsync('/', {ip: ALLOWED_IP, reputation: 10})
      }).spread(function (req, res, obj) {
        t.equal(res.statusCode, 201, 'sets reputation for ALLOWED_IP')
        return client.postAsync('/check', { email: TEST_EMAIL, ip: ALLOWED_IP, action: TEST_CHECK_ACTION })
      }).spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200')
        t.equal(obj.block, false, 'action not blocked')
        t.end()
      }).catch(function(err) {
        t.fail(err)
        t.end()
      })
  }
)

test(
  '/check returns when GET IP reputation service returns an bad response',
  function (t) {
    return client.postAsync('/check', { email: TEST_EMAIL, ip: TEST_BAD_IP, action: TEST_CHECK_ACTION })
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200')
        t.equal(obj.block, false, 'action not blocked')
        t.end()
      }).catch(function(err) {
        t.fail(err)
        t.end()
      })
  }
)

test(
  'teardown test reputation server',
  function (t) {
    reputationServer.stop()
    t.equal(reputationServer.server.killed, true, 'test reputation server killed')
    t.end()
  }
)

test(
  '/check returns when GET IP reputation times out',
  function (t) {
    return client.postAsync('/check', { email: TEST_EMAIL, ip: TEST_IP, action: TEST_CHECK_ACTION })
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200')
        t.equal(obj.block, false, 'action not blocked')
        t.end()
      }).catch(function(err) {
        t.fail(err)
        t.end()
      })
  }
)

test(
  'teardown test server',
  function (t) {
    testServer.stop()
    t.equal(testServer.server.killed, true, 'test server killed')
    t.end()
  }
)
