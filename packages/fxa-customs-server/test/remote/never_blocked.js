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

test('maximum number of emails', function(t) {
  return client
    .postAsync('/check', {
      email: TEST_EMAIL,
      ip: TEST_IP,
      action: 'accountCreate',
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'first email attempt');
      t.equal(obj.block, false, 'creating the account');

      return client.postAsync('/check', {
        email: TEST_EMAIL,
        ip: TEST_IP,
        action: 'recoveryEmailResendCode',
      });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'second email attempt');
      t.equal(obj.block, false, 'resending the code');

      return client.postAsync('/check', {
        email: TEST_EMAIL,
        ip: TEST_IP,
        action: 'recoveryEmailResendCode',
      });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'third email attempt');
      t.equal(obj.block, false, 'resending the code');

      return new Promise(function(resolve, reject) {
        mcHelper.blockedEmailCheck(function(isBlocked) {
          t.equal(isBlocked, false, 'account is still not blocked');
          resolve();
        });
      });
    })
    .catch(function(err) {
      t.fail(err);
      t.end();
    });
});

test('maximum failed logins', function(t) {
  return client
    .postAsync('/failedLoginAttempt', { email: TEST_EMAIL, ip: TEST_IP })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'first login attempt noted');
      t.ok(obj, 'got an obj, make jshint happy');

      return client.postAsync('/failedLoginAttempt', {
        email: TEST_EMAIL,
        ip: TEST_IP,
      });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'second login attempt noted');
      t.ok(obj, 'got an obj, make jshint happy');

      return mcHelper.badLoginCheck();
    })
    .then(function(records) {
      t.equal(
        records.ipEmailRecord.isOverBadLogins(),
        false,
        'is still not over bad logins'
      );

      return client.postAsync('/check', {
        email: TEST_EMAIL,
        ip: TEST_IP,
        action: 'accountLogin',
      });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'attempting to login');
      t.equal(obj.block, false, 'login is not blocked');
    })
    .catch(function(err) {
      t.fail(err);
      t.end();
    });
});

test('teardown', async function(t) {
  await testServer.stop();
  t.end();
});
