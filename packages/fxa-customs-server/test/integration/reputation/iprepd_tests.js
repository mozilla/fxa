/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test;
var TestServer = require('../../test_server');
var Promise = require('bluebird');
var restifyClients = require('restify-clients');
var mcHelper = require('../../memcache-helper');

var TEST_EMAIL = 'test@example.com';
var TEST_IP = '192.0.2.1';
var TEST_CHECK_ACTION = 'recoveryEmailVerifyCode';
const ENDPOINTS = ['/check', '/checkIpOnly'];

// wait for the violation to be sent for endpoints that respond
// before sending violation
var TEST_DELAY_MS = 500;

var config = {
  listen: {
    port: 7000,
  },
  limits: {
    rateLimitIntervalSeconds: 1,
  },
  reputationService: {
    enable: true,
    enableCheck: true,
    blockBelow: 50,
    suspectBelow: 60,
    baseUrl: 'http://iprepd.host:9085',
    timeout: 25,
    hawkId: 'root',
    hawkKey: 'toor',
  },
};

var repJSClientConfig = {
  serviceUrl: config.reputationService.baseUrl,
  id: 'root',
  key: 'toor',
  timeout: 25,
};
var ipr = require('ip-reputation-js-client');
var repJSClient = new ipr(repJSClientConfig);

process.env.REPUTATION_SERVICE_ENABLE = config.reputationService.enable;
process.env.REPUTATION_SERVICE_BASE_URL = config.reputationService.baseUrl;
process.env.REPUTATION_SERVICE_TIMEOUT = config.reputationService.timeout;
process.env.REPUTATION_SERVICE_ENABLE_CHECK =
  config.reputationService.enableCheck;
process.env.REPUTATION_SERVICE_BLOCK_BELOW =
  config.reputationService.blockBelow;
process.env.REPUTATION_SERVICE_SUSPECT_BELOW =
  config.reputationService.suspectBelow;
process.env.REPUTATION_SERVICE_HAWK_ID = config.reputationService.hawkId;
process.env.REPUTATION_SERVICE_HAWK_KEY = config.reputationService.hawkKey;

var testServer = new TestServer(config);

var client = restifyClients.createJsonClient({
  url: 'http://localhost:' + config.listen.port,
});

Promise.promisifyAll(client, { multiArgs: true });

test('startup test server', function (t) {
  testServer.start(function (err) {
    t.type(testServer.server, 'object', 'test server was started');
    t.notOk(err, 'no errors were returned');
    t.end();
  });
});

ENDPOINTS.forEach((endpoint) => {
  test('clear everything', (t) => {
    mcHelper.clearEverything(function (err) {
      t.notOk(err, 'no errors were returned');
      t.end();
    });
  });

  test(`does not block ${endpoint} for IP with nonexistent reputation`, (t) => {
    return repJSClient
      .remove(TEST_IP)
      .then(function (response) {
        t.equal(
          response.statusCode,
          200,
          'clears reputation in iprepd for TEST_IP'
        );
        return client.postAsync(endpoint, {
          email: TEST_EMAIL,
          ip: TEST_IP,
          action: TEST_CHECK_ACTION,
        });
      })
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200');
        t.equal(obj.block, false, 'action not blocked');
        t.end();
      })
      .catch(function (err) {
        t.fail(err);
        t.end();
      });
  });

  test(`does not block ${endpoint} for IP with reputation above blockBelow`, (t) => {
    return repJSClient
      .remove(TEST_IP)
      .then(function (response) {
        t.equal(
          response.statusCode,
          200,
          'clears reputation in iprepd for TEST_IP'
        );
        return repJSClient.update(TEST_IP, 65);
      })
      .then(function (response) {
        t.equal(
          response.statusCode,
          200,
          'update reputation in iprepd for TEST_IP'
        );
        return client.postAsync(endpoint, {
          email: TEST_EMAIL,
          ip: TEST_IP,
          action: TEST_CHECK_ACTION,
        });
      })
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200');
        t.equal(obj.suspect, false, 'action suspected');
        t.equal(obj.block, false, 'action not blocked');
        t.end();
      })
      .catch(function (err) {
        t.fail(err);
        t.end();
      });
  });

  test(`suspects ${endpoint} for IP with reputation below suspectBelow`, (t) => {
    return repJSClient
      .remove(TEST_IP)
      .then(function (response) {
        t.equal(
          response.statusCode,
          200,
          'clears reputation in iprepd for TEST_IP'
        );
        return repJSClient.update(TEST_IP, 55);
      })
      .then(function (response) {
        t.equal(
          response.statusCode,
          200,
          'update reputation in iprepd for TEST_IP'
        );
        return client.postAsync(endpoint, {
          email: TEST_EMAIL,
          ip: TEST_IP,
          action: TEST_CHECK_ACTION,
        });
      })
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200');
        t.equal(obj.suspect, true, 'action suspected');
        t.equal(obj.block, false, 'action not blocked');
        t.end();
      })
      .catch(function (err) {
        t.fail(err);
        t.end();
      });
  });

  test(`blocks ${endpoint} for IP with reputation below blockBelow`, (t) => {
    return repJSClient
      .remove(TEST_IP)
      .then(function (response) {
        t.equal(
          response.statusCode,
          200,
          'clears reputation in iprepd for TEST_IP'
        );
        return repJSClient.update(TEST_IP, 20);
      })
      .then(function (response) {
        t.equal(
          response.statusCode,
          200,
          'update reputation in iprepd for TEST_IP'
        );
        return client.postAsync(endpoint, {
          email: TEST_EMAIL,
          ip: TEST_IP,
          action: TEST_CHECK_ACTION,
        });
      })
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'check returns 200');
        t.equal(obj.block, true, 'action blocked blocked');
        t.equal(obj.blockReason, undefined, 'block reason not returned');
        t.end();
      })
      .catch(function (err) {
        t.fail(err);
        t.end();
      });
  });
});

test('sends violation for blocked IP from /blockIp request', function (t) {
  return repJSClient
    .remove(TEST_IP)
    .then(function (response) {
      t.equal(
        response.statusCode,
        200,
        'clears reputation in iprepd for TEST_IP'
      );
      return client.postAsync('/blockIp', { ip: TEST_IP });
    })
    .spread(function (req, res, obj) {
      t.equal(res.statusCode, 200, 'blockIp returns 200');
      return Promise.delay(TEST_DELAY_MS);
    })
    .then(function () {
      return repJSClient.get(TEST_IP);
    })
    .then(function (response) {
      t.equal(response.body.reputation, 50, 'violation was applied to TEST_IP');
      t.end();
    })
    .catch(function (err) {
      t.fail(err);
      t.end();
    });
});

test('teardown test server', function (t) {
  testServer.stop();
  t.equal(testServer.server.killed, true, 'test server killed');
  t.end();
});
