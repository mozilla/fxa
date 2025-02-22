/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const test = require('tap').test;
const TestServer = require('../test_server');
const Promise = require('bluebird');
const restifyClients = Promise.promisifyAll(require('restify-clients'));
const mcHelper = require('../cache-helper');
Promise.promisifyAll(mcHelper, { multiArgs: true });

function randomEmail() {
  return Math.floor(Math.random() * 10000) + '@email.com';
}

function randomIp() {
  function getSubnet() {
    return Math.floor(Math.random() * 255);
  }
  return [getSubnet(), getSubnet(), getSubnet(), getSubnet()].join('.');
}

function randomUid() {
  return Math.floor(Math.random() * 10000) + '';
}

const config = require('../../lib/config').getProperties();
config.userDefinedRateLimitRules.totpCodeRules.limits.periodMs = 1000;
config.userDefinedRateLimitRules.totpCodeRules.limits.rateLimitIntervalMs = 1000;
config.userDefinedRateLimitRules.tokenCodeRules.limits.max = 2;
config.userDefinedRateLimitRules.tokenCodeRules.limits.periodMs = 1000;
config.userDefinedRateLimitRules.tokenCodeRules.limits.rateLimitIntervalMs = 1000;

config.userDefinedRateLimitRules.recoveryPhoneSendSetupCodeRules.limits.max = 5;
config.userDefinedRateLimitRules.recoveryPhoneSendSetupCodeRules.limits.periodMs = 5000;
config.userDefinedRateLimitRules.recoveryPhoneSendSetupCodeRules.limits.rateLimitIntervalMs = 1000;

config.userDefinedRateLimitRules.recoveryPhoneSendSigninCodeRules.limits.max = 5;
config.userDefinedRateLimitRules.recoveryPhoneSendSigninCodeRules.limits.periodMs = 5000;
config.userDefinedRateLimitRules.recoveryPhoneSendSigninCodeRules.limits.rateLimitIntervalMs = 1000;

const ACTIONS = ['verifyTotpCode', 'verifyTokenCode'];

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

ACTIONS.forEach((action) => {
  test('clear everything', (t) => {
    mcHelper.clearEverything((err) => {
      t.notOk(err, 'no errors were returned');
      t.end();
    });
  });

  test('/check `' + action + '` by email', (t) => {
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
        .catch((err) => {
          t.fail(err);
          t.end();
        })
    );
  });

  test('/check `' + action + '` does not rate limit other actions', (t) => {
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
      .catch((err) => {
        t.fail(err);
        t.end();
      });
  });
});

const recoveryPhoneActions = [
  'recoveryPhoneSendSetupCode',
  'recoveryPhoneSendSigninCode',
];
recoveryPhoneActions.forEach((action) => {
  test(`clear everything for ${action}`, async (t) => {
    try {
      await mcHelper.clearEverythingAsync();
      t.pass('cleared redis');
    } catch (err) {
      t.fail(err);
    } finally {
      t.end();
    }
  });

  test('/checkAuthenticated `' + action + '` by uid', async (t) => {
    const uid = randomUid();
    const ip = randomIp();
    // Send requests until throttled
    let [req, res, obj] = await client.postAsync('/checkAuthenticated', {
      ip,
      action,
      uid,
    });
    t.equal(res.statusCode, 200, 'returns a 200');
    t.equal(obj.block, false, 'not rate limited');

    [req, res, obj] = await client.postAsync('/checkAuthenticated', {
      ip,
      action,
      uid,
    });
    t.equal(res.statusCode, 200, 'returns a 200');
    t.equal(obj.block, false, 'not rate limited');

    [req, res, obj] = await client.postAsync('/checkAuthenticated', {
      ip,
      action,
      uid,
    });
    t.equal(res.statusCode, 200, 'returns a 200');
    t.equal(obj.block, false, 'not rate limited');

    [req, res, obj] = await client.postAsync('/checkAuthenticated', {
      ip,
      action,
      uid,
    });
    t.equal(res.statusCode, 200, 'returns a 200');
    t.equal(obj.block, false, 'not rate limited');

    [req, res, obj] = await client.postAsync('/checkAuthenticated', {
      ip,
      action,
      uid,
    });
    t.equal(res.statusCode, 200, 'returns a 200');
    t.equal(obj.block, false, 'not rate limited');

    [req, res, obj] = await client.postAsync('/checkAuthenticated', {
      ip,
      action,
      uid,
    });
    t.equal(res.statusCode, 200, 'returns a 200');
    t.equal(obj.block, true, 'rate limited');
    t.equal(obj.retryAfter, 1, 'rate limit retry amount');

    // Wait for limit to expire
    await Promise.delay(1010);

    [req, res, obj] = await client.postAsync('/checkAuthenticated', {
      ip,
      action,
      uid,
    });
    t.equal(res.statusCode, 200, 'returns a 200');
    t.equal(obj.block, false, 'not rate limited');

    t.pass(req);
    t.end();
  });
});

test('teardown', async function (t) {
  await testServer.stop();
  t.end();
});
