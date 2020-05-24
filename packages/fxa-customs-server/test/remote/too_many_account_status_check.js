/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test;
var TestServer = require('../test_server');
var Promise = require('bluebird');
var restifyClients = Promise.promisifyAll(require('restify-clients'));
var mcHelper = require('../memcache-helper');

var TEST_IP = '192.0.2.1';
var ACCOUNT_STATUS_CHECK = 'accountStatusCheck';

// Override limit values for testing
const config = require('../../lib/config').getProperties();
config.limits.maxAccountStatusCheck = 2;
config.limits.ipRateLimitIntervalSeconds = 1;
config.limits.ipRateLimitBanDurationSeconds = 1;

var testServer = new TestServer(config);

var client = restifyClients.createJsonClient({
  url: 'http://localhost:' + config.listen.port,
});

Promise.promisifyAll(client, { multiArgs: true });

test('startup', async function (t) {
  await testServer.start();
  t.type(testServer.server, 'object', 'test server was started');
  t.end();
});

test('clear everything', function (t) {
  mcHelper.clearEverything(function (err) {
    t.notOk(err, 'no errors were returned');
    t.end();
  });
});

test('/check `accountStatusCheck`', function (t) {
  // Send requests until throttled
  return (
    client
      .postAsync('/check', {
        ip: TEST_IP,
        email: 'test1@example.com',
        action: ACCOUNT_STATUS_CHECK,
      })
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, false, 'not rate limited');
        return client.postAsync('/check', {
          ip: TEST_IP,
          email: 'test2@example.com',
          action: ACCOUNT_STATUS_CHECK,
        });
      })
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, false, 'not rate limited');
        // Try a previous email again, should not be counted twice
        return client.postAsync('/check', {
          ip: TEST_IP,
          email: 'test1@example.com',
          action: ACCOUNT_STATUS_CHECK,
        });
      })
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, false, 'not rate limited');
        return client.postAsync('/check', {
          ip: TEST_IP,
          email: 'test3@example.com',
          action: ACCOUNT_STATUS_CHECK,
        });
      })
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, true, 'rate limited');
        t.equal(obj.retryAfter, 1, 'rate limit retry amount');

        // Delay ~1s for rate limit to go away
        return Promise.delay(1010);
      })

      // Reissue requests to verify that throttling is disabled
      .then(function () {
        return client.postAsync('/check', {
          ip: TEST_IP,
          email: 'test1@example.com',
          action: ACCOUNT_STATUS_CHECK,
        });
      })
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, false, 'not rate limited');
        return client.postAsync('/check', {
          ip: TEST_IP,
          email: 'test2@example.com',
          action: ACCOUNT_STATUS_CHECK,
        });
      })
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, false, 'not rate limited');
        return client.postAsync('/check', {
          ip: TEST_IP,
          email: 'test3@example.com',
          action: ACCOUNT_STATUS_CHECK,
        });
      })
      .spread(function (req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, true, 'rate limited');
        t.equal(obj.retryAfter, 1, 'rate limit retry amount');
        t.end();
      })
      .catch(function (err) {
        t.fail(err);
        t.end();
      })
  );
});

test('teardown', async function (t) {
  await testServer.stop();
  t.end();
});
