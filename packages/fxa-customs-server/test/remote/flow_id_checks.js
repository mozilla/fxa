/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */
/*eslint camelcase: ["error", {properties: "never"}]*/
var test = require('tap').test;
var clients = require('restify-clients');
var Promise = require('bluebird');
var TestServer = require('../test_server');
var mcHelper = require('../memcache-helper');

var TEST_EMAIL = 'test@example.com';
var TEST_IP = '192.0.2.1';
var EXEMPT_USER_AGENT = 'Testo 2K1/12 (Windows; rv:12.12) Gecko/10';

const config = require('../../lib/config').getProperties();
config.requestChecks.flowIdRequiredOnLogin = true;
config.requestChecks.flowIdExemptUserAgentREs = ['Testo\\s+.?'];

var testServer = new TestServer(config);

test('startup', async function(t) {
  await testServer.start();
  t.type(testServer.server, 'object', 'test server was started');
  t.end();
});

test('clear everything', function(t) {
  mcHelper.clearEverything(function(err) {
    t.notOk(err, 'no errors were returned');
    t.end();
  });
});

var client = clients.createJsonClient({
  url: 'http://127.0.0.1:' + config.listen.port,
});
Promise.promisifyAll(client, { multiArgs: true });

test('request with missing metricsContext is blocked', function(t) {
  client.post(
    '/check',
    {
      ip: TEST_IP,
      email: TEST_EMAIL,
      action: 'accountLogin',
    },
    function(err, req, res, obj) {
      t.equal(res.statusCode, 200, 'check worked');
      t.equal(obj.block, true, 'request was blocked');
      t.notOk(obj.retryAfter, 'there was no retry-after');
      t.end();
    }
  );
});

test('request with missing flowId is blocked', function(t) {
  client.post(
    '/check',
    {
      ip: TEST_IP,
      email: TEST_EMAIL,
      action: 'accountLogin',
      payload: {
        metricsContext: {
          utm_campaign: 'test-campaign',
        },
      },
    },
    function(err, req, res, obj) {
      t.equal(res.statusCode, 200, 'check worked');
      t.equal(obj.block, true, 'request was blocked');
      t.notOk(obj.retryAfter, 'there was no retry-after');
      t.end();
    }
  );
});

test('request with flowId is not blocked', function(t) {
  client.post(
    '/check',
    {
      ip: TEST_IP,
      email: TEST_EMAIL,
      action: 'accountLogin',
      payload: {
        metricsContext: {
          flowId: 'F1031D',
          utm_campaign: 'test-campaign',
        },
      },
    },
    function(err, req, res, obj) {
      t.equal(res.statusCode, 200, 'check worked');
      t.equal(obj.block, false, 'request was not blocked');
      t.notOk(obj.retryAfter, 'there was no retry-after');
      t.end();
    }
  );
});

test('request without flowId for @restmail.net address is not blocked', function(t) {
  client.post(
    '/check',
    {
      ip: TEST_IP,
      email: 'exempt@restmail.net',
      action: 'accountLogin',
      payload: {
        metricsContext: {
          utm_campaign: 'test-campaign',
        },
      },
    },
    function(err, req, res, obj) {
      t.equal(res.statusCode, 200, 'check worked');
      t.equal(obj.block, false, 'request was not blocked');
      t.notOk(obj.retryAfter, 'there was no retry-after');
      t.end();
    }
  );
});

test('requests without flowId from certain user-agents are not blocked', function(t) {
  return client.post(
    {
      path: '/check',
      headers: {
        'user-agent': EXEMPT_USER_AGENT,
      },
    },
    {
      ip: TEST_IP,
      email: TEST_EMAIL,
      action: 'accountLogin',
      payload: {
        something: 'irrelevant',
      },
    },
    function(err, req, res, obj) {
      t.equal(res.statusCode, 200, 'check worked');
      t.equal(obj.block, false, 'request was not blocked');
      t.notOk(obj.retryAfter, 'there was no retry-after');
      t.end();
    }
  );
});

test('request with missing flowId and Android user-agent is blocked', function(t) {
  client.post(
    {
      path: '/check',
      headers: {
        'user-agent':
          'Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0',
      },
    },
    {
      ip: TEST_IP,
      email: TEST_EMAIL,
      action: 'accountLogin',
      payload: {
        metricsContext: {
          utm_campaign: 'test-campaign',
        },
      },
    },
    function(err, req, res, obj) {
      t.equal(res.statusCode, 200, 'check worked');
      t.equal(obj.block, true, 'request was blocked');
      t.notOk(obj.retryAfter, 'there was no retry-after');
      t.end();
    }
  );
});

test('request with reason=signin is blocked', function(t) {
  client.post(
    '/check',
    {
      ip: TEST_IP,
      email: TEST_EMAIL,
      action: 'accountLogin',
      payload: {
        reason: 'signin',
        metricsContext: {
          utm_campaign: 'test-campaign',
        },
      },
    },
    function(err, req, res, obj) {
      t.equal(res.statusCode, 200, 'check worked');
      t.equal(obj.block, true, 'request was blocked');
      t.end();
    }
  );
});

test('request with reason=password_change is not blocked', function(t) {
  client.post(
    '/check',
    {
      ip: TEST_IP,
      email: TEST_EMAIL,
      action: 'accountLogin',
      payload: {
        reason: 'password_change',
        metricsContext: {
          utm_campaign: 'test-campaign',
        },
      },
    },
    function(err, req, res, obj) {
      t.equal(res.statusCode, 200, 'check worked');
      t.equal(obj.block, false, 'request was not blocked');
      t.end();
    }
  );
});

test('teardown', async function(t) {
  await testServer.stop();
  t.end();
});
