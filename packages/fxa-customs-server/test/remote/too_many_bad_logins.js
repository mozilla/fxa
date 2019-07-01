/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test;
var restifyClients = require('restify-clients');
var TestServer = require('../test_server');
var Promise = require('bluebird');
var mcHelper = require('../memcache-helper');

var TEST_EMAIL = 'test@example.com';
var TEST_IP = '192.0.2.1';

var config = {
  listen: {
    port: 7000,
  },
  limits: {
    rateLimitIntervalSeconds: 1,
  },
};

var testServer = new TestServer(config);

var client = restifyClients.createJsonClient({
  url: 'http://127.0.0.1:' + config.listen.port,
});

Promise.promisifyAll(client, { multiArgs: true });

test('startup', function(t) {
  testServer.start(function(err) {
    t.type(testServer.server, 'object', 'test server was started');
    t.notOk(err, 'no errors were returned');
    t.end();
  });
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

test('teardown', function(t) {
  testServer.stop();
  t.equal(testServer.server.killed, true, 'test server has been killed');
  t.end();
});
