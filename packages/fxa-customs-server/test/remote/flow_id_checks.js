/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test
var restify = require('restify')
var Promise = require('bluebird')
var TestServer = require('../test_server')
var mcHelper = require('../memcache-helper')

var TEST_EMAIL = 'test@example.com'
var TEST_IP = '192.0.2.1'

process.env.FLOW_ID_REQUIRED_ON_LOGIN = 'true'
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
})
Promise.promisifyAll(client, { multiArgs: true })

test(
  'request with missing metricsContext is blocked',
  function (t) {
    client.post('/check',
      {
        ip: TEST_IP,
        email: TEST_EMAIL,
        action: 'accountLogin'
      },
      function (err, req, res, obj) {
        t.equal(res.statusCode, 200, 'check worked')
        t.equal(obj.block, true, 'request was blocked')
        t.notOk(obj.retryAfter, 'there was no retry-after')
        t.end()
      }
    )
  }
)

test(
  'request with missing flowId is blocked',
  function (t) {
    client.post('/check',
      {
        ip: TEST_IP,
        email: TEST_EMAIL,
        action: 'accountLogin',
        payload: {
          metricsContext: {
            utm_campaign: 'test-campaign'
          }
        }
      },
      function (err, req, res, obj) {
        t.equal(res.statusCode, 200, 'check worked')
        t.equal(obj.block, true, 'request was blocked')
        t.notOk(obj.retryAfter, 'there was no retry-after')
        t.end()
      }
    )
  }
)

test(
  'request with flowId is not blocked',
  function (t) {
    client.post('/check',
      {
        ip: TEST_IP,
        email: TEST_EMAIL,
        action: 'accountLogin',
        payload: {
          metricsContext: {
            flowId: 'F1031D',
            utm_campaign: 'test-campaign'
          }
        }
      },
      function (err, req, res, obj) {
        t.equal(res.statusCode, 200, 'check worked')
        t.equal(obj.block, false, 'request was not blocked')
        t.notOk(obj.retryAfter, 'there was no retry-after')
        t.end()
      }
    )
  }
)

test(
  'request without flowId for @restmail.net address is not blocked',
  function (t) {
    client.post('/check',
      {
        ip: TEST_IP,
        email: 'exempt@restmail.net',
        action: 'accountLogin',
        payload: {
          metricsContext: {
            utm_campaign: 'test-campaign'
          }
        }
      },
      function (err, req, res, obj) {
        t.equal(res.statusCode, 200, 'check worked')
        t.equal(obj.block, false, 'request was not blocked')
        t.notOk(obj.retryAfter, 'there was no retry-after')
        t.end()
      }
    )
  }
)

test(
  'requests without flowId from certain user-agents are not blocked',
  function (t) {
    var EXEMPT_USER_AGENTS = [
      'Mozilla/5.0 (TV; rv:44.0) Gecko/44.0 Firefox/44.0',
      'Mozilla/5.0 (FreeBSD; Viera; rv:44.0) Gecko/20100101 Firefox/44.0',
      'Mozilla/5.0 (Linux; Android 5.0.1; SAMSUNG SM-N910F Build/LRX22C) AppleWebKit/537.36(KHTML, like Gecko) SamsungBrowser/3.0 Chrome/38.0.2125.102 Mobile Safari/537.36',
      'Firefox AndroidSync 1.40.0 (SBrowser)',
      'Mozilla/5.0 (iOS; OS 9_3_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13D15 iCab Mobile/9.4'
    ]
    return Promise.each(EXEMPT_USER_AGENTS, function(userAgent) {
      return client.postAsync('/check', {
        ip: TEST_IP,
        email: TEST_EMAIL,
        action: 'accountLogin',
        payload: {
          something: 'irrelevant'
        },
        headers: {
          'user-agent': userAgent
        }
      })
      .spread(
        function (req, res, obj) {
          t.equal(res.statusCode, 200, 'check worked')
          t.equal(obj.block, false, 'request was not blocked')
          t.notOk(obj.retryAfter, 'there was no retry-after')
        }
      )
    })
    .then(
      function () {
        t.end()
      },
      function (err) {
        t.fail(err)
        t.end()
      }
    )
  }
)

test(
  'request with missing flowId and Android user-agent is blocked',
  function (t) {
    client.post('/check',
      {
        ip: TEST_IP,
        email: TEST_EMAIL,
        action: 'accountLogin',
        payload: {
          metricsContext: {
            utm_campaign: 'test-campaign'
          }
        },
        headers: {
          'user-agent': 'Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0'
        }
      },
      function (err, req, res, obj) {
        t.equal(res.statusCode, 200, 'check worked')
        t.equal(obj.block, true, 'request was blocked')
        t.notOk(obj.retryAfter, 'there was no retry-after')
        t.end()
      }
    )
  }
)

test(
  'request with reason=signin is blocked',
  function (t) {
    client.post('/check',
      {
        ip: TEST_IP,
        email: TEST_EMAIL,
        action: 'accountLogin',
        payload: {
          reason: 'signin',
          metricsContext: {
            utm_campaign: 'test-campaign'
          }
        }
      },
      function (err, req, res, obj) {
        t.equal(res.statusCode, 200, 'check worked')
        t.equal(obj.block, true, 'request was blocked')
        t.end()
      }
    )
  }
)

test(
  'request with reason=password_change is not blocked',
  function (t) {
    client.post('/check',
      {
        ip: TEST_IP,
        email: TEST_EMAIL,
        action: 'accountLogin',
        payload: {
          reason: 'password_change',
          metricsContext: {
            utm_campaign: 'test-campaign'
          }
        }
      },
      function (err, req, res, obj) {
        t.equal(res.statusCode, 200, 'check worked')
        t.equal(obj.block, false, 'request was not blocked')
        t.end()
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
