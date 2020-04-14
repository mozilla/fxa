/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const test = require('tap').test;
const TestServer = require('../test_server');
const Promise = require('bluebird');
const restifyClients = Promise.promisifyAll(require('restify-clients'));
const mcHelper = require('../memcache-helper');

function randomEmail() {
  return Math.floor(Math.random() * 10000) + '@email.com';
}

function randomIp() {
  function getSubnet() {
    return Math.floor(Math.random() * 255);
  }
  return [getSubnet(), getSubnet(), getSubnet(), getSubnet()].join('.');
}

const config = require('../../lib/config').getProperties();
config.userDefinedRateLimitRules.totpCodeRules.limits.periodMs = 1000;
config.userDefinedRateLimitRules.totpCodeRules.limits.rateLimitIntervalMs = 1000;
config.userDefinedRateLimitRules.tokenCodeRules.limits.max = 2;
config.userDefinedRateLimitRules.tokenCodeRules.limits.periodMs = 1000;
config.userDefinedRateLimitRules.tokenCodeRules.limits.rateLimitIntervalMs = 1000;

const ACTIONS = ['verifyTotpCode', 'verifyTokenCode'];

const testServer = new TestServer(config);

const client = restifyClients.createJsonClient({
  url: 'http://localhost:' + config.listen.port,
});

Promise.promisifyAll(client, { multiArgs: true });

test('startup', async function(t) {
  await testServer.start();
  t.type(testServer.server, 'object', 'test server was started');
  t.end();
});

ACTIONS.forEach(action => {
  test('clear everything', t => {
    mcHelper.clearEverything(err => {
      t.notOk(err, 'no errors were returned');
      t.end();
    });
  });

  test('/check `' + action + '` by email', t => {
    const email = randomEmail();
    const ip = randomIp();
    // Send requests until throttled
    return (
      client
        .postAsync('/check', { ip, action, email })
        .spread((req, res, obj) => {
          t.equal(res.statusCode, 200, 'returns a 200');
          t.equal(obj.block, false, 'not rate limited');
          return client.postAsync('/check', { ip, action, email });
        })
        .spread((req, res, obj) => {
          t.equal(res.statusCode, 200, 'returns a 200');
          t.equal(obj.block, false, 'not rate limited');
          return client.postAsync('/check', { ip, action, email });
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
          return client.postAsync('/check', { ip, action, email });
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

  test('/check `' + action + '` does not rate limit other actions', t => {
    const email = randomEmail();
    const ip = randomIp();
    return client
      .postAsync('/check', { ip, action, email })
      .spread(() => {
        return client.postAsync('/check', { ip, action, email });
      })
      .spread(() => {
        return client.postAsync('/check', { ip, action, email });
      })
      .spread((req, res, obj) => {
        t.equal(obj.block, true, 'rate limited');
        return client.postAsync('/check', {
          ip,
          action: 'accountLogin',
          email,
        });
      })
      .spread((req, res, obj) => {
        t.equal(obj.block, false, 'not rate limited');
        return client.postAsync('/check', {
          ip,
          action: 'accountLogin',
          email: randomEmail(),
        });
      })
      .spread((req, res, obj) => {
        t.equal(obj.block, false, 'not rate limited');
        return client.postAsync('/check', {
          ip: randomIp(),
          action: 'accountLogin',
          email,
        });
      })
      .spread((req, res, obj) => {
        t.equal(obj.block, false, 'not rate limited');
      })
      .catch(err => {
        t.fail(err);
        t.end();
      });
  });
});

test('teardown', async function(t) {
  await testServer.stop();
  t.end();
});
