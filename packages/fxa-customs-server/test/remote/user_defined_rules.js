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

const config = {
  listen: {
    port: 7000,
  },
};

process.env.TOTP_CODE_RULE_MAX = process.env.TOKEN_CODE_RULE_MAX = 2;
process.env.TOTP_CODE_RULE_PERIOD_MS = process.env.TOKEN_CODE_RULE_PERIOD_MS = 1000;
process.env.TOTP_CODE_RULE_LIMIT_INTERVAL_MS = process.env.TOKEN_CODE_RULE_LIMIT_INTERVAL_MS = 1000;

const ACTIONS = ['verifyTotpCode', 'verifyTokenCode'];

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

test('teardown', t => {
  testServer.stop();
  t.equal(testServer.server.killed, true, 'test server has been killed');
  t.end();
});
