/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict';

const memcached = require('../memcache-helper');
const Promise = require('bluebird');
const restifyClients = Promise.promisifyAll(require('restify-clients'));
const test = require('tap').test;
const TestServer = require('../test_server');

const IP = '192.168.1.2';
const ACTION = 'consumeSigninCode';

const config = require('../../lib/config').getProperties();
config.limits.maxAccountAccess = 2;
config.limits.ipRateLimitIntervalSeconds = 1;
config.limits.ipRateLimitBanDurationSeconds = 1;

const testServer = new TestServer(config);

const client = restifyClients.createJsonClient({
  url: 'http://127.0.0.1:' + config.listen.port,
});

Promise.promisifyAll(client, { multiArgs: true });

test('startup', async function(t) {
  await testServer.start();
  t.type(testServer.server, 'object', 'test server was started');
  t.end();
});

test('clear everything', t => {
  memcached.clearEverything(err => {
    t.notOk(err, 'memcached.clearEverything should not return an error');
    t.end();
  });
});

test(`/checkIpOnly ${ACTION}`, t => {
  return client
    .postAsync('/checkIpOnly', {
      ip: IP,
      action: ACTION,
    })
    .spread((req, res, obj) => {
      t.equal(res.statusCode, 200, '/checkIpOnly should return a 200 response');
      t.equal(obj.block, false, '/checkIpOnly should return block:false');

      return client.postAsync('/checkIpOnly', {
        ip: IP,
        action: ACTION,
      });
    })
    .spread((req, res, obj) => {
      t.equal(res.statusCode, 200, '/checkIpOnly should return a 200 response');
      t.equal(obj.block, false, '/checkIpOnly should return block:false');

      return client.postAsync('/checkIpOnly', {
        ip: IP,
        action: ACTION,
      });
    })
    .spread((req, res, obj) => {
      t.equal(res.statusCode, 200, '/checkIpOnly should return a 200 response');
      t.equal(obj.block, true, '/checkIpOnly should return block:true');
      t.equal(obj.retryAfter, 1, '/checkIpOnly should return retryAfter:1');

      return Promise.delay(1001);
    })
    .then(() => {
      return client.postAsync('/checkIpOnly', {
        ip: IP,
        action: ACTION,
      });
    })
    .spread((req, res, obj) => {
      t.equal(res.statusCode, 200, '/checkIpOnly should return a 200 response');
      t.equal(obj.block, false, '/checkIpOnly should return block:false');
      t.end();
    })
    .catch(err => {
      t.fail(err);
      t.end();
    });
});

test('teardown', async function(t) {
  await testServer.stop();
  t.end();
});
