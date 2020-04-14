/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test;
var TestServer = require('../test_server');
var ReputationServer = require('../test_reputation_server');
var Promise = require('bluebird');
var restifyClients = require('restify-clients');
var mcHelper = require('../memcache-helper');

var TEST_EMAIL = 'test@example.com';
var TEST_IP = '192.0.2.1';
var TEST_BAD_IP = '9.9.9.9';
var ALLOWED_IP = '192.0.3.1';
var TEST_CHECK_ACTION = 'recoveryEmailVerifyCode';
const ENDPOINTS = ['/check', '/checkIpOnly'];

// wait for the violation to be sent for endpoints that respond
// before sending violation
var TEST_DELAY_MS = 500;

const config = require('../../lib/config').getProperties();
config.limits.rateLimitIntervalSeconds = 1;
config.allowedIPs = [ALLOWED_IP];
config.reputationService = {
  enable: true,
  enableCheck: true,
  blockBelow: 50,
  suspectBelow: 60,
  hawkId: 'root',
  hawkKey: 'toor',
  baseUrl: 'http://localhost:9009',
  timeout: 25,
};

// We use a restify based test reputation client to query the reputation server stub
// in here for testing purposes, but also instantiate an instance of the actual reputation
// client to verify some of the behavior in the module.
var repJSClientConfig = {
  serviceUrl: config.reputationService.baseUrl,
  id: 'root',
  key: 'toor',
  timeout: 25,
};
var ipr = require('ip-reputation-js-client');
var repJSClient = new ipr(repJSClientConfig);

var testServer = new TestServer(config);

var client = restifyClients.createJsonClient({
  url: 'http://localhost:' + config.listen.port,
});

Promise.promisifyAll(client, { multiArgs: true });

test('startup', async function(t) {
  await testServer.start();
  t.type(testServer.server, 'object', 'test server was started');
  t.end();
});

ENDPOINTS.forEach(endpoint => {
  const reputationServer = new ReputationServer(config);
  const reputationClient = restifyClients.createJsonClient({
    url: config.reputationService.baseUrl,
  });
  Promise.promisifyAll(reputationClient, { multiArgs: true });

  test('startup reputation service', async t => {
    await reputationServer.start();
    t.end();
  });

  test('clear everything', t => {
    mcHelper.clearEverything(function(err) {
      t.notOk(err, 'no errors were returned');
      t.end();
    });
  });

  test('query reputation stub directly using ip-reputation-js-client', t => {
    return reputationClient
      .getAsync('/heartbeat')
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'clears reputation for TEST_IP');
        return repJSClient.remove(TEST_IP);
      })
      .then(() => {
        return repJSClient.get(TEST_IP);
      })
      .then(function(response) {
        t.equal(
          response.statusCode,
          404,
          'reputation value for TEST_IP not found'
        );
        var f =
          response &&
          response.timingPhases &&
          response.timingPhases.total &&
          typeof response.timingPhases.total === 'number' &&
          response.timingPhases.total > 0.0;
        t.equal(f, true, 'response contains timing data');
        t.end();
      })
      .catch(function(err) {
        t.fail(err);
        t.end();
      });
  });

  test(`does not block ${endpoint} for IP with nonexistent reputation`, t => {
    return reputationClient
      .delAsync('/' + TEST_IP)
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'clears reputation for TEST_IP');
        return client.postAsync(endpoint, {
          email: TEST_EMAIL,
          ip: TEST_IP,
          action: TEST_CHECK_ACTION,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200');
        t.equal(obj.block, false, 'action not blocked');
        t.end();
      })
      .catch(function(err) {
        t.fail(err);
        t.end();
      });
  });

  test(`does not block ${endpoint} for IP with reputation above blockBelow`, t => {
    return reputationClient
      .delAsync('/' + TEST_IP)
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'clears reputation for TEST_IP');
        return reputationClient.putAsync('/' + TEST_IP, {
          ip: TEST_IP,
          reputation: 60,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'sets reputation for TEST_IP');
        return client.postAsync(endpoint, {
          email: TEST_EMAIL,
          ip: TEST_IP,
          action: TEST_CHECK_ACTION,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200');
        t.equal(obj.block, false, 'action not blocked');
        t.end();
      })
      .catch(function(err) {
        t.fail(err);
        t.end();
      });
  });

  test(`suspects ${endpoint} for IP with reputation below suspectBelow`, t => {
    return reputationClient
      .delAsync('/' + TEST_IP)
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'clears reputation for TEST_IP');
        return reputationClient.putAsync('/' + TEST_IP, {
          ip: TEST_IP,
          reputation: 55,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'sets reputation for TEST_IP');
        return client.postAsync(endpoint, {
          email: TEST_EMAIL,
          ip: TEST_IP,
          action: TEST_CHECK_ACTION,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200');
        t.equal(obj.suspect, true, 'action suspected');
        t.equal(obj.block, false, 'action not blocked');
        t.end();
      })
      .catch(function(err) {
        t.fail(err);
        t.end();
      });
  });

  test(`blocks ${endpoint} for IP with reputation below blockBelow`, t => {
    return reputationClient
      .delAsync('/' + TEST_IP)
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'clears reputation for TEST_IP');
        return reputationClient.putAsync('/' + TEST_IP, {
          ip: TEST_IP,
          reputation: 10,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'sets reputation for TEST_IP');
        return client.postAsync(endpoint, {
          email: TEST_EMAIL,
          ip: TEST_IP,
          action: TEST_CHECK_ACTION,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200');
        t.equal(obj.block, true, 'action blocked');
        t.equal(
          obj.blockReason,
          'ip_reputation_too_low',
          'block reason returned'
        );
        return Promise.delay(TEST_DELAY_MS);
      })
      .then(function() {
        return reputationClient.getAsync('/mostRecentViolation/' + TEST_IP);
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200');
        t.strictDeepEqual(obj, {}, 'no violations sent');
        t.end();
      })
      .catch(function(err) {
        t.fail(err);
        t.end();
      });
  });

  test(`does not block ${endpoint} for whitelisted IP with reputation below blockBelow`, t => {
    return reputationClient
      .delAsync('/' + ALLOWED_IP)
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'clears reputation for ALLOWED_IP');
        return reputationClient.putAsync('/' + ALLOWED_IP, {
          ip: ALLOWED_IP,
          reputation: 10,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'sets reputation for ALLOWED_IP');
        return client.postAsync(endpoint, {
          email: TEST_EMAIL,
          ip: ALLOWED_IP,
          action: TEST_CHECK_ACTION,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200');
        t.equal(obj.block, false, 'action not blocked');
        t.end();
      })
      .catch(function(err) {
        t.fail(err);
        t.end();
      });
  });

  test(`${endpoint} returns when GET IP reputation service returns an bad response`, t => {
    return client
      .postAsync(endpoint, {
        email: TEST_EMAIL,
        ip: TEST_BAD_IP,
        action: TEST_CHECK_ACTION,
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200');
        t.equal(obj.block, false, 'action not blocked');
        t.end();
      })
      .catch(function(err) {
        t.fail(err);
        t.end();
      });
  });

  test('teardown test reputation server', async t => {
    await reputationServer.stop();
    t.end();
  });

  test(`${endpoint} returns when GET IP reputation times out`, t => {
    return client
      .postAsync(endpoint, {
        email: TEST_EMAIL,
        ip: TEST_IP,
        action: TEST_CHECK_ACTION,
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200');
        t.equal(obj.block, false, 'action not blocked');
        t.end();
      })
      .catch(function(err) {
        t.fail(err);
        t.end();
      });
  });
});

test('teardown', async function(t) {
  await testServer.stop();
  t.end();
});
