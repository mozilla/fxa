/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test;
var restifyClients = require('restify-clients');
var TestServer = require('../test_server');
var Promise = require('bluebird');
var mcHelper = require('../memcache-helper');
const { randomEmail, randomIp } = require('../utils');

var TEST_EMAIL = randomEmail();
var TEST_IP = randomIp();

const config = require('../../lib/config').getProperties();
var testServer = new TestServer(config);

var client = restifyClients.createJsonClient({
  url: 'http://localhost:' + config.listen.port,
});

Promise.promisifyAll(client, { multiArgs: true });

test('startup', async function (t) {
  await testServer.start();
  t.type(testServer.server, 'object', 'test server was started');
  t.end();
});

test('clear everything', function (t) {
  mcHelper.clearEverything(function (err) {
    t.notOk(err, 'no errors were returned');
    t.end();
  });
});

test('too many failed logins', function (t) {
  return client
    .postAsync('/failedLoginAttempt', { email: TEST_EMAIL, ip: TEST_IP })
    .spread(function (req, res, obj) {
      t.equal(res.statusCode, 200, 'first login attempt noted');
      t.ok(obj, 'got an obj, make jshint happy');

      return client.postAsync('/failedLoginAttempt', {
        email: TEST_EMAIL,
        ip: TEST_IP,
      });
    })
    .spread(function (req, res, obj) {
      t.equal(res.statusCode, 200, 'second login attempt noted');
      t.ok(obj, 'got an obj, make jshint happy');

      return client.postAsync('/failedLoginAttempt', {
        email: TEST_EMAIL,
        ip: TEST_IP,
      });
    })
    .spread(function (req, res, obj) {
      t.equal(res.statusCode, 200, 'third login attempt noted');
      t.ok(obj, 'got an obj, make jshint happy');

      return client.postAsync('/check', {
        email: TEST_EMAIL,
        ip: TEST_IP,
        action: 'accountLogin',
      });
    })
    .spread(function (req, res, obj) {
      t.equal(res.statusCode, 200, 'login check succeeds');
      t.equal(obj.block, true, 'login is blocked');
    })
    .catch(function (err) {
      t.fail(err);
      t.end();
    });
});

test('failed logins are cleared', { skip: true }, function (t) {
  return client
    .postAsync('/passwordReset', { email: TEST_EMAIL })
    .spread(function (req, res, obj) {
      t.equal(res.statusCode, 200, 'request returns a 200');
      t.ok(obj, 'got an obj, make jshint happy');

      return client.postAsync('/check', {
        email: TEST_EMAIL,
        ip: TEST_IP,
        action: 'accountLogin',
      });
    })
    .spread(function (req, res, obj) {
      t.equal(res.statusCode, 200, 'login check succeeds');
      t.equal(obj.block, false, 'login is no longer blocked');
    })
    .catch(function (err) {
      t.fail(err);
      t.end();
    });
});

test('teardown', async function (t) {
  await testServer.stop();
  t.end();
});
