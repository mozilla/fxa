/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test;
var restifyClients = require('restify-clients');
var TestServer = require('../test_server');
var Promise = require('bluebird');
var mcHelper = require('../memcache-helper');

var TEST_EMAIL = 'test@example.com';
var TEST_IP = '192.0.2.1';

const config = require('../../lib/config').getProperties();
config.limits.rateLimitIntervalSeconds = 1;

var testServer = new TestServer(config);

var client = restifyClients.createJsonClient({
  url: 'http://localhost:' + config.listen.port,
});

Promise.promisifyAll(client, { multiArgs: true });

test('startup', async function(t) {
  await testServer.start();
  t.type(testServer.server, 'object', 'test server was started');
  t.end();
});

test('clear everything', function(t) {
  mcHelper.clearEverything(function(err) {
    t.notOk(err, 'no errors were returned');
    t.end();
  });
});

test('too many failed logins from the same IP', function(t) {
  return client
    .postAsync('/failedLoginAttempt', { email: TEST_EMAIL, ip: TEST_IP })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'first login attempt noted');
      return client.postAsync('/failedLoginAttempt', {
        email: TEST_EMAIL,
        ip: TEST_IP,
      });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'second login attempt noted');

      return mcHelper.badLoginCheck();
    })
    .then(function(records) {
      t.equal(
        records.ipEmailRecord.isOverBadLogins(),
        false,
        'is not yet over bad logins'
      );

      return client.postAsync('/failedLoginAttempt', {
        email: TEST_EMAIL,
        ip: TEST_IP,
      });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'third login attempt noted');

      return mcHelper.badLoginCheck();
    })
    .then(function(records) {
      t.equal(
        records.ipEmailRecord.isOverBadLogins(),
        true,
        'is now over bad logins'
      );
    })
    .catch(function(err) {
      t.fail(err);
      t.end();
    });
});

test('failed logins expire', function(t) {
  return Promise.delay(config.limits.rateLimitIntervalSeconds * 1000)
    .then(function() {
      return mcHelper.badLoginCheck();
    })
    .then(function(records) {
      t.equal(
        records.ipEmailRecord.isOverBadLogins(),
        false,
        'is no longer over bad logins'
      );
      t.end();
    });
});

test('clear everything', function(t) {
  mcHelper.clearEverything(function(err) {
    t.notOk(err, 'no errors were returned');
    t.end();
  });
});

test('too many failed logins from the same email', async t => {
  const IP0 = '192.0.2.10';
  const IP1 = '192.0.2.11';
  const IP2 = '192.0.2.12';
  const IP3 = '192.0.2.13';

  // eslint-disable-next-line no-unused-vars
  let [req, res, obj] = await client.postAsync('/failedLoginAttempt', {
    email: TEST_EMAIL,
    ip: IP0,
  });
  t.equal(res.statusCode, 200, 'login attempt noted');
  [req, res, obj] = await client.postAsync('/check', {
    email: TEST_EMAIL,
    ip: IP0,
    action: 'accountLogin',
  });
  t.equal(obj.block, false, 'not blocked');

  [req, res, obj] = await client.postAsync('/failedLoginAttempt', {
    email: TEST_EMAIL,
    ip: IP1,
  });
  t.equal(res.statusCode, 200, 'login attempt noted');
  [req, res, obj] = await client.postAsync('/check', {
    email: TEST_EMAIL,
    ip: IP1,
    action: 'accountLogin',
  });
  t.equal(obj.block, false, 'not blocked');

  [req, res, obj] = await client.postAsync('/failedLoginAttempt', {
    email: TEST_EMAIL,
    ip: IP2,
  });
  t.equal(res.statusCode, 200, 'login attempt noted');
  [req, res, obj] = await client.postAsync('/check', {
    email: TEST_EMAIL,
    ip: IP2,
    action: 'accountLogin',
  });
  t.equal(obj.block, false, 'not blocked');

  [req, res, obj] = await client.postAsync('/failedLoginAttempt', {
    email: TEST_EMAIL,
    ip: IP3,
  });
  t.equal(res.statusCode, 200, 'login attempt noted');
  [req, res, obj] = await client.postAsync('/check', {
    email: TEST_EMAIL,
    ip: IP3,
    action: 'accountLogin',
  });
  t.equal(obj.block, true, 'blocked');
  t.equal(obj.retryAfter, 1, 'blocked');
  t.equal(obj.blockReason, 'other');

  // Delay 1s for rate limit to go away
  await Promise.delay(1000);

  // Attempt to login again, not rate limited
  [req, res, obj] = await client.postAsync('/check', {
    email: TEST_EMAIL,
    ip: IP0,
    action: 'accountLogin',
  });
  t.equal(obj.block, false, 'not blocked');
});

test('clear everything', function(t) {
  mcHelper.clearEverything(function(err) {
    t.notOk(err, 'no errors were returned');
    t.end();
  });
});

test('teardown', async function(t) {
  await testServer.stop();
  t.end();
});
