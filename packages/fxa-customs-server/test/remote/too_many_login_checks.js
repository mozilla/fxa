/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Override limit values for testing
process.env.MAX_BAD_LOGINS_PER_IP = 2;
process.env.IP_RATE_LIMIT_INTERVAL_SECONDS = 2;
process.env.IP_RATE_LIMIT_BAN_DURATION_SECONDS = 5;

var test = require('tap').test;
var TestServer = require('../test_server');
var Promise = require('bluebird');
var restifyClients = Promise.promisifyAll(require('restify-clients'));
var mcHelper = require('../memcache-helper');

var TEST_IP = '192.0.2.1';
var ACCOUNT_LOGIN = 'accountLogin';

var config = {
  listen: {
    port: 7000,
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

test('/check `accountLogin` with different emails', function(t) {
  // Send requests until throttled
  return (
    client
      .postAsync('/failedLoginAttempt', {
        ip: TEST_IP,
        email: 'test-fail1@example.com',
        action: ACCOUNT_LOGIN,
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'failed login 1');

        return client.postAsync('/failedLoginAttempt', {
          ip: TEST_IP,
          email: 'test-fail2@example.com',
          action: ACCOUNT_LOGIN,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'failed login 2');

        return client.postAsync('/check', {
          ip: TEST_IP,
          email: 'test1@example.com',
          action: ACCOUNT_LOGIN,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, false, 'not rate limited');

        return client.postAsync('/failedLoginAttempt', {
          ip: TEST_IP,
          email: 'test-fail3@example.com',
          action: ACCOUNT_LOGIN,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'failed login 3');

        return client.postAsync('/check', {
          ip: TEST_IP,
          email: 'test2@example.com',
          action: ACCOUNT_LOGIN,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, true, 'ip is now rate limited');
        t.ok(obj.retryAfter > 0, 'rate limit retry amount');

        return client.postAsync('/check', {
          ip: TEST_IP,
          email: 'test3@example.com',
          action: ACCOUNT_LOGIN,
        });
      })
      // IP should be now blocked
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, true, 'ip is still rate limited');

        // Delay ~5s for rate limit to go away
        return Promise.delay(5010);
      })
      // IP should be now unblocked
      .then(function() {
        return client.postAsync('/check', {
          ip: TEST_IP,
          email: 'test5@example.com',
          action: ACCOUNT_LOGIN,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(
          obj.block,
          false,
          'is not rate limited after IP_RATE_LIMIT_INTERVAL_SECONDS'
        );
        t.end();
      })
      .catch(function(err) {
        t.fail(err);
        t.end();
      })
  );
});

test('/check `accountLogin` with different emails - bad logins extend retry limit', function(t) {
  // Send requests until throttled
  return client
    .postAsync('/failedLoginAttempt', {
      ip: TEST_IP,
      email: 'test-fail1@example.com',
      action: ACCOUNT_LOGIN,
    })
    .spread(function(req, res, obj) {
      return client.postAsync('/failedLoginAttempt', {
        ip: TEST_IP,
        email: 'test-fail2@example.com',
        action: ACCOUNT_LOGIN,
      });
    })
    .spread(function(req, res, obj) {
      return client.postAsync('/failedLoginAttempt', {
        ip: TEST_IP,
        email: 'test-fail3@example.com',
        action: ACCOUNT_LOGIN,
      });
    })
    .spread(function(req, res, obj) {
      return client.postAsync('/check', {
        ip: TEST_IP,
        email: 'test2@example.com',
        action: ACCOUNT_LOGIN,
      });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'returns a 200');
      t.equal(obj.retryAfter, 5, 'rate limit retry amount');
      t.equal(obj.block, true, 'ip is now rate limited');
      // delay by 1 second, do another action within rl interval
      return Promise.delay(1000);
    })
    .then(function() {
      return client.postAsync('/check', {
        ip: TEST_IP,
        email: 'test3@example.com',
        action: ACCOUNT_LOGIN,
      });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'returns a 200');
      t.equal(obj.retryAfter, 5, 'rate limit duration is renewed');
      t.equal(obj.block, true, 'ip is still rate limited');
      // delay by 3 seconds, to escape the rl interval
      return Promise.delay(3000);
    })
    .then(function() {
      return client.postAsync('/check', {
        ip: TEST_IP,
        email: 'test4@example.com',
        action: ACCOUNT_LOGIN,
      });
    })
    .spread(function(req, res, obj) {
      t.ok(obj.retryAfter < 3, 'rate limit duration is not renewed');
      t.equal(obj.block, true, 'ip is still rate limited');
      t.end();
    })
    .catch(function(err) {
      t.fail(err);
      t.end();
    });
});

test('teardown', function(t) {
  testServer.stop();
  t.equal(testServer.server.killed, true, 'test server has been killed');
  t.end();
});
