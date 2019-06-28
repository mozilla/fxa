/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const test = require('tap').test;
const TestServer = require('../test_server');
const Promise = require('bluebird');
const restifyClients = Promise.promisifyAll(require('restify-clients'));
const mcHelper = require('../memcache-helper');
const testUtils = require('../utils');

const TEST_IP = '192.0.2.1';

const config = {
  listen: {
    port: 7000,
  },
};

// Override limit values for testing
process.env.MAX_VERIFY_CODES = 2;
process.env.RATE_LIMIT_INTERVAL_SECONDS = 1;
process.env.IP_RATE_LIMIT_INTERVAL_SECONDS = 1;
process.env.IP_RATE_LIMIT_BAN_DURATION_SECONDS = 1;

const testServer = new TestServer(config);

const client = restifyClients.createJsonClient({
  url: 'http://127.0.0.1:' + config.listen.port,
});

Promise.promisifyAll(client, { multiArgs: true });

test('startup', t => {
  testServer.start(err => {
    t.type(testServer.server, 'object', 'test server was started');
    t.notOk(err, 'no errors were returned');
    t.end();
  });
});

const VERIFY_CODE_ACTIONS = [
  'recoveryEmailVerifyCode',
  'passwordForgotVerifyCode',
  'verifyRecoveryCode',
];

VERIFY_CODE_ACTIONS.forEach(action => {
  test('clear everything', t => {
    mcHelper.clearEverything(err => {
      t.notOk(err, 'no errors were returned');
      t.end();
    });
  });

  test('/check `' + action + '` by email', t => {
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
        .catch(err => {
          t.fail(err);
          t.end();
        })
    );
  });

  test('clear everything', t => {
    mcHelper.clearEverything(err => {
      t.notOk(err, 'no errors were returned');
      t.end();
    });
  });

  test('/check `' + action + '` by ip', t => {
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
        .catch(err => {
          t.fail(err);
          t.end();
        })
    );
  });
});

test('teardown', t => {
  testServer.stop();
  t.equal(testServer.server.killed, true, 'test server has been killed');
  t.end();
});
