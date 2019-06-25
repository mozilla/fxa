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

const config = {
  listen: {
    port: 7000,
  },
};

process.env.MAX_ACCOUNT_ACCESS = 2;
process.env.IP_RATE_LIMIT_INTERVAL_SECONDS = 1;
process.env.IP_RATE_LIMIT_BAN_DURATION_SECONDS = 1;

const testServer = new TestServer(config);

const client = restifyClients.createJsonClient({
  url: 'http://127.0.0.1:' + config.listen.port,
});

Promise.promisifyAll(client, { multiArgs: true });

test('startup', t => {
  testServer.start(err => {
    t.type(
      testServer.server,
      'object',
      'testServer.server should be an object'
    );
    t.notOk(err, 'testServer.start should not return an error');
    t.end();
  });
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

test('teardown', t => {
  testServer.stop();
  t.equal(
    testServer.server.killed,
    true,
    'testServer.server.killed should be true'
  );
  t.end();
});
