/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict';

const test = require('tap').test;
const restifyClients = require('restify-clients');
const TestServer = require('../test_server');
const Promise = require('bluebird');
const mcHelper = require('../memcache-helper');

const TEST_EMAIL = 'test@example.com';
const TEST_IP = '192.0.2.1';

const config = require('../../lib/config').getProperties();

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

test('clear everything', (t) => {
  mcHelper.clearEverything((err) => {
    t.notOk(err, 'no errors were returned');
    t.end();
  });
});

test('check with unblockCode in paylaod gets counted', (t) => {
  return client
    .postAsync('/check', {
      email: TEST_EMAIL,
      ip: TEST_IP,
      action: 'accountLogin',
      payload: {
        unblockCode: 'abcd1234',
      },
    })
    .spread((req, res, obj) => {
      t.equal(res.statusCode, 200, 'first login attempt noted');
      return mcHelper.badLoginCheck();
    })
    .then((records) => {
      t.equal(
        records.emailRecord.ub.length,
        1,
        'should have record 1 unblock attempt'
      );
      t.end();
    })
    .catch((err) => {
      t.fail(err);
      t.end();
    });
});

test('teardown', async function (t) {
  await testServer.stop();
  t.end();
});
