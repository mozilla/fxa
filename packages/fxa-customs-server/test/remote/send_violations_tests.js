/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var tap = require('tap');
var test = tap.test;
var TestServer = require('../test_server');
var ReputationServer = require('../test_reputation_server');
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

const config = require('../../lib/config').getProperties();
config.limits.rateLimitIntervalSeconds = 1;
config.allowedIPs = [ALLOWED_IP];
config.reputationService = {
  enable: true,
  enableCheck: true,
  blockBelow: 50,
  suspectBelow: 60,
  hawkId: 'root',
  hawkKey: 'toor',
  baseUrl: 'http://localhost:9009',
  timeout: 25,
};

// Override limit values for testing
config.allowedIPs = [ALLOWED_IP];
config.limits.maxVerifyCodes = 2;
config.limits.maxBadLoginsPerIp = 1;
config.limits.uidRateLimit.maxChecks = 3;
config.limits.uidRateLimit.limitIntervalSeconds = 2;
config.limits.uidRateLimit.banDurationSeconds = 2;

var testServer = new TestServer(config);
var reputationServer = new ReputationServer(config);

var client = restifyClients.createJsonClient({
  url: 'http://localhost:' + config.listen.port,
});
var reputationClient = restifyClients.createJsonClient({
  url: config.reputationService.baseUrl,
});

Promise.promisifyAll(client, { multiArgs: true });
Promise.promisifyAll(reputationClient, { multiArgs: true });

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

test('startup reputation service', async function(t) {
  await reputationServer.start();
  t.end();
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
      const { violation } = obj;
      t.equal(
        violation,
        `fxa:request.check.block.${TEST_CHECK_ACTION}`,
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
        obj.violation,
        `fxa:request.checkAuthenticated.block.${action}`,
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
        obj.violation,
        'fxa:request.failedLoginAttempt.isOverBadLogins',
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
        obj.violation,
        'fxa:request.blockIp',
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

test('teardown', async function(t) {
  await testServer.stop();
  t.end();
});
