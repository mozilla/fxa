/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const test = require('tap').test;
const TestServer = require('../test_server');
const Promise = require('bluebird');
const restifyClients = Promise.promisifyAll(require('restify-clients'));
const mcHelper = require('../memcache-helper');
const testUtils = require('../utils');

const TEST_IP = '192.0.2.1';

const config = require('../../lib/config').getProperties();
config.limits.maxVerifyCodes = 2;
config.limits.rateLimitIntervalSeconds = 1;
config.limits.ipRateLimitIntervalSeconds = 1;
config.limits.ipRateLimitBanDurationSeconds = 1;

const testServer = new TestServer(config);

const client = restifyClients.createJsonClient({
  url: 'http://localhost:' + config.listen.port,
});

Promise.promisifyAll(client, { multiArgs: true });

test('startup', async function (t) {
  await testServer.start();
  t.type(testServer.server, 'object', 'test server was started');
  t.end();
});

const VERIFY_CODE_ACTIONS = [
  'recoveryEmailVerifyCode',
  'passwordForgotVerifyCode',
  'verifyRecoveryCode',
];

VERIFY_CODE_ACTIONS.forEach((action) => {
  test('clear everything', (t) => {
    mcHelper.clearEverything((err) => {
      t.notOk(err, 'no errors were returned');
      t.end();
    });
  });

  test('/check `' + action + '` by email', (t) => {
    // Send requests until throttled
    const email = testUtils.randomEmail();
    const ip = testUtils.randomIp();
    return (
      client
        .postAsync('/check', { ip, email, action })
        .spread((req, res, obj) => {
          t.equal(res.statusCode, 200, 'returns a 200');
          t.equal(obj.block, false, 'not rate limited');
          return client.postAsync('/check', { ip, email, action });
        })
        .spread((req, res, obj) => {
          t.equal(res.statusCode, 200, 'returns a 200');
          t.equal(obj.block, false, 'not rate limited');
          return client.postAsync('/check', { ip, email, action });
        })
        .spread((req, res, obj) => {
          t.equal(res.statusCode, 200, 'returns a 200');
          t.equal(obj.block, true, 'rate limited');
          t.equal(obj.retryAfter, 1, 'rate limit retry amount');

          // Delay ~1s for rate limit to go away
          return Promise.delay(1010);
        })

        // Reissue requests to verify that throttling is disabled
        .then(() => {
          return client.postAsync('/check', { ip, email, action });
        })
        .spread((req, res, obj) => {
          t.equal(res.statusCode, 200, 'returns a 200');
          t.equal(obj.block, false, 'not rate limited');
          t.end();
        })
        .catch((err) => {
          t.fail(err);
          t.end();
        })
    );
  });

  test('clear everything', (t) => {
    mcHelper.clearEverything((err) => {
      t.notOk(err, 'no errors were returned');
      t.end();
    });
  });

  test('/check `' + action + '` by ip', (t) => {
    // Send requests until throttled
    return (
      client
        .postAsync('/check', {
          ip: TEST_IP,
          email: 'test2@example.com',
          action: action,
        })
        .spread((req, res, obj) => {
          t.equal(res.statusCode, 200, 'returns a 200');
          t.equal(obj.block, false, 'not rate limited');
          return client.postAsync('/check', {
            ip: TEST_IP,
            email: 'test3@example.com',
            action: action,
          });
        })
        .spread((req, res, obj) => {
          t.equal(res.statusCode, 200, 'returns a 200');
          t.equal(obj.block, false, 'not rate limited');
          // Repeat email, not rate-limited yet.
          return client.postAsync('/check', {
            ip: TEST_IP,
            email: 'test2@example.com',
            action: action,
          });
        })
        .spread((req, res, obj) => {
          t.equal(res.statusCode, 200, 'returns a 200');
          t.equal(obj.block, false, 'not rate limited');
          return client.postAsync('/check', {
            ip: TEST_IP,
            email: 'test4@example.com',
            action: action,
          });
        })
        .spread((req, res, obj) => {
          t.equal(res.statusCode, 200, 'returns a 200');
          t.equal(obj.block, true, 'rate limited');
          t.equal(obj.retryAfter, 1, 'rate limit retry amount');

          // Delay ~1s for rate limit to go away
          return Promise.delay(1010);
        })

        // Reissue requests to verify that throttling is disabled
        .then(() => {
          return client.postAsync('/check', {
            ip: TEST_IP,
            email: 'test4@example.com',
            action: action,
          });
        })
        .spread((req, res, obj) => {
          t.equal(res.statusCode, 200, 'returns a 200');
          t.equal(obj.block, false, 'not rate limited');
          t.end();
        })
        .catch((err) => {
          t.fail(err);
          t.end();
        })
    );
  });
});

test('teardown', async function (t) {
  await testServer.stop();
  t.end();
});
