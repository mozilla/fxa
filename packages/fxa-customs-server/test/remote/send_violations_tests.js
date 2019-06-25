/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test;
var TestServer = require('../test_server');
var ReputationServerStub = require('../test_reputation_server');
var Promise = require('bluebird');
var restifyClients = require('restify-clients');
var mcHelper = require('../memcache-helper');
const testUtils = require('../utils');

var TEST_EMAIL = 'test@example.com';
var TEST_EMAIL_2 = 'test+2@example.com';
var TEST_IP = '192.0.2.1';
var ALLOWED_IP = '192.0.3.1';
var TEST_CHECK_ACTION = 'recoveryEmailVerifyCode';

// wait for the violation to be sent for endpoints that respond
// before sending violation
var TEST_DELAY_MS = 850;

var config = {
  listen: {
    port: 7000,
  },
  limits: {
    rateLimitIntervalSeconds: 15,
  },
  reputationService: {
    enable: true,
    baseUrl: 'http://127.0.0.1:9009',
    timeout: 25,
  },
};

// Override limit values for testing
process.env.ALLOWED_IPS = ALLOWED_IP;
process.env.MAX_VERIFY_CODES = 2;
process.env.MAX_BAD_LOGINS_PER_IP = 1;
process.env.UID_RATE_LIMIT = 3;
process.env.UID_RATE_LIMIT_INTERVAL_SECONDS = 2;
process.env.UID_RATE_LIMIT_BAN_DURATION_SECONDS = 2;
process.env.RATE_LIMIT_INTERVAL_SECONDS =
  config.limits.rateLimitIntervalSeconds;

// Enable reputation test server
process.env.REPUTATION_SERVICE_ENABLE = config.reputationService.enable;
process.env.REPUTATION_SERVICE_BASE_URL = config.reputationService.baseUrl;
process.env.REPUTATION_SERVICE_TIMEOUT = config.reputationService.timeout;

var testServer = new TestServer(config);
var reputationServer = new ReputationServerStub(config);

var client = restifyClients.createJsonClient({
  url: 'http://127.0.0.1:' + config.listen.port,
});
var reputationClient = restifyClients.createJsonClient({
  url: config.reputationService.baseUrl,
});

Promise.promisifyAll(client, { multiArgs: true });
Promise.promisifyAll(reputationClient, { multiArgs: true });

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

test('/check resulting in lockout runs when send violation fails', function(t) {
  return client
    .postAsync('/check', {
      email: TEST_EMAIL,
      ip: TEST_IP,
      action: TEST_CHECK_ACTION,
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'first action noted');
      t.equal(obj.block, false, 'first action not blocked');
      return client.postAsync('/check', {
        email: TEST_EMAIL,
        ip: TEST_IP,
        action: TEST_CHECK_ACTION,
      });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'second action noted');
      t.equal(obj.block, false, 'second action not blocked');
      return client.postAsync('/check', {
        email: TEST_EMAIL,
        ip: TEST_IP,
        action: TEST_CHECK_ACTION,
      });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'third action attempt noted');
      t.equal(obj.block, true, 'third action blocked');
    })
    .catch(function(err) {
      t.fail(err);
      t.end();
    });
});

test('/checkAuthenticated rate limited runs when sends violation fails', function(t) {
  const ip = testUtils.randomIp();
  const action = testUtils.randomHexString(5);
  const uid = testUtils.randomHexString(5);
  return client
    .postAsync('/checkAuthenticated', { action, ip, uid })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'returns 200 for /checkAuthenticated 1');
      t.equal(obj.block, false, 'not rate limited');
      return client.postAsync('/checkAuthenticated', { action, ip, uid });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'returns 200 for /checkAuthenticated 2');
      t.equal(obj.block, false, 'not rate limited');
      return client.postAsync('/checkAuthenticated', { action, ip, uid });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'returns 200 for /checkAuthenticated 3');
      t.equal(obj.block, true, 'rate limited');
      t.end();
    })
    .catch(function(err) {
      t.fail(err);
      t.end();
    });
});

test('/failedLoginAttempt resulting in lockout runs when send violation fails', function(t) {
  return client
    .postAsync('/failedLoginAttempt', { email: TEST_EMAIL, ip: TEST_IP })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'first login attempt noted');
      return client.postAsync('/failedLoginAttempt', {
        email: TEST_EMAIL_2,
        ip: TEST_IP,
      });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'second login attempt noted');
      return client.postAsync('/failedLoginAttempt', {
        email: TEST_EMAIL,
        ip: TEST_IP,
      });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'third login attempt noted');
      return client.postAsync('/failedLoginAttempt', {
        email: TEST_EMAIL,
        ip: TEST_IP,
      });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'fourth login attempt noted');
      return mcHelper.badLoginCheck();
    })
    .then(function(records) {
      t.equal(
        records.ipEmailRecord.isOverBadLogins(),
        true,
        'is now over bad logins'
      );
      t.end();
    })
    .catch(function(err) {
      t.fail(err);
      t.end();
    });
});

test('/blockIp returns when send violation fails', function(t) {
  return client
    .postAsync('/blockIp', { ip: TEST_IP })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'blockIp returns 200');
      t.end();
    });
});

test('clear everything again', function(t) {
  mcHelper.clearEverything(function(err) {
    t.notOk(err, 'no errors were returned');
    t.end();
  });
});

test('startup reputation service', function(t) {
  reputationServer.start(function(err) {
    t.type(reputationServer.server, 'object', 'test server was started');
    t.notOk(err, 'no errors were returned');
    t.end();
  });
});

test('sends violation /check resulting in lockout', function(t) {
  const email = testUtils.randomEmail();
  const ip = testUtils.randomIp();
  return client
    .postAsync('/check', { email, ip, action: TEST_CHECK_ACTION })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'first action noted');
      t.equal(obj.block, false, 'first action not blocked');
      return client.postAsync('/check', {
        email,
        ip,
        action: TEST_CHECK_ACTION,
      });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'second action noted');
      t.equal(obj.block, false, 'second action not blocked');
      return client.postAsync('/check', {
        email,
        ip,
        action: TEST_CHECK_ACTION,
      });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'third action attempt noted');
      t.equal(obj.block, true, 'third action blocked');
      return Promise.delay(TEST_DELAY_MS);
    })
    .then(function() {
      return reputationClient.getAsync('/mostRecentViolation/' + ip);
    })
    .spread(function(req, res, obj) {
      t.equal(
        res.body,
        '"fxa:request.check.block.' + TEST_CHECK_ACTION + '"',
        'sends violation when /check'
      );
      return reputationClient.delAsync('/mostRecentViolation/' + ip);
    })
    .spread(function(req, res, obj) {
      t.equal(
        res.statusCode,
        200,
        'Failed to clear sent violation from test server.'
      );
      t.end();
    })
    .catch(function(err) {
      t.fail(err);
      t.end();
    });
});

test('sends violation when /checkAuthenticated rate limited', function(t) {
  const ip = testUtils.randomIp();
  const action = testUtils.randomHexString(5);
  const uid = testUtils.randomHexString(5);
  return client
    .postAsync('/checkAuthenticated', { action, ip, uid })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'returns 200 for /checkAuthenticated 1');
      t.equal(obj.block, false, 'not rate limited');
      return client.postAsync('/checkAuthenticated', { action, ip, uid });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'returns 200 for /checkAuthenticated 2');
      t.equal(obj.block, false, 'not rate limited');
      return client.postAsync('/checkAuthenticated', { action, ip, uid });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'returns 200 for /checkAuthenticated 3');
      t.equal(obj.block, true, 'rate limited');
      return Promise.delay(TEST_DELAY_MS);
    })
    .then(function() {
      return reputationClient.getAsync('/mostRecentViolation/' + ip);
    })
    .spread(function(req, res, obj) {
      t.equal(
        res.body,
        `"fxa:request.checkAuthenticated.block.${action}"`,
        'Violation sent.'
      );
      return reputationClient.delAsync('/mostRecentViolation/' + ip);
    })
    .spread(function(req, res, obj) {
      t.equal(
        res.statusCode,
        200,
        'Failed to clear sent violation from test server.'
      );
      t.end();
    })
    .catch(function(err) {
      t.fail(err);
      t.end();
    });
});

test('sends violation /failedLoginAttempt results in lockout', function(t) {
  return client
    .postAsync('/failedLoginAttempt', { email: TEST_EMAIL, ip: TEST_IP })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'first login attempt noted');
      return client.postAsync('/failedLoginAttempt', {
        email: TEST_EMAIL_2,
        ip: TEST_IP,
      });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'second login attempt noted');
      return reputationClient.getAsync('/mostRecentViolation/' + TEST_IP);
    })
    .spread(function(req, res, obj) {
      t.equal(
        res.body,
        '"fxa:request.failedLoginAttempt.isOverBadLogins"',
        'sends violation.'
      );
      return reputationClient.delAsync('/mostRecentViolation/' + TEST_IP);
    })
    .spread(function(req, res, obj) {
      t.equal(
        res.statusCode,
        200,
        'Failed to clear sent violation from test server.'
      );
      t.end();
    })
    .catch(function(err) {
      t.fail(err);
      t.end();
    });
});

test('sends violation for blocked IP from /blockIp request', function(t) {
  return client
    .postAsync('/blockIp', { ip: TEST_IP })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'blockIp returns 200');
      return Promise.delay(TEST_DELAY_MS);
    })
    .then(function() {
      return reputationClient.getAsync('/mostRecentViolation/' + TEST_IP);
    })
    .spread(function(req, res, obj) {
      t.equal(
        res.body,
        '"fxa:request.blockIp"',
        'sends violation when IP blocked'
      );
      return reputationClient.delAsync('/mostRecentViolation/' + TEST_IP);
    })
    .spread(function(req, res, obj) {
      t.equal(
        res.statusCode,
        200,
        'Failed to clear sent violation from test server.'
      );
      t.end();
    })
    .catch(function(err) {
      t.fail(err);
      t.end();
    });
});

test('teardown test reputation server', function(t) {
  reputationServer.stop();
  t.equal(
    reputationServer.server.killed,
    true,
    'test reputation server killed'
  );
  t.end();
});

test('teardown test server', function(t) {
  testServer.stop();
  t.equal(testServer.server.killed, true, 'test server killed');
  t.end();
});
