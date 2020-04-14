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
  url: 'http://127.0.0.1:' + config.listen.port,
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

test('too many sent emails', function(t) {
  return client
    .postAsync('/check', {
      email: TEST_EMAIL,
      ip: TEST_IP,
      action: 'recoveryEmailResendCode',
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'first email attempt');
      t.equal(obj.block, false, 'resending the code');

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

      return client.postAsync('/check', {
        email: TEST_EMAIL,
        ip: TEST_IP,
        action: 'recoveryEmailResendCode',
      });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'fourth email attempt');
      t.equal(obj.block, true, 'operation blocked');

      return new Promise(function(resolve, reject) {
        mcHelper.blockedEmailCheck(function(isBlocked) {
          t.equal(isBlocked, true, 'account is blocked');
          resolve();
        });
      });
    })
    .catch(function(err) {
      t.fail(err);
      t.end();
    });
});

test('failed logins expire', function(t) {
  setTimeout(function() {
    mcHelper.blockedEmailCheck(function(isBlocked) {
      t.equal(isBlocked, false, 'account no longer blocked');
      t.end();
    });
  }, config.limits.rateLimitIntervalSeconds * 1000);
});

test('teardown', async function(t) {
  await testServer.stop();
  t.end();
});
