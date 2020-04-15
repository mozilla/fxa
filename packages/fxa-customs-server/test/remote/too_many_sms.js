/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test;
var TestServer = require('../test_server');
var Promise = require('bluebird');
var restifyClients = Promise.promisifyAll(require('restify-clients'));

var TEST_IP = '192.0.2.1';
var TEST_IP2 = '192.0.2.2';
var TEST_IP3 = '192.0.2.3';
var TEST_IP4 = '192.0.2.4';
var TEST_IP5 = '192.0.2.5';
var TEST_IP6 = '192.0.2.6';
var CONNECT_DEVICE_SMS = 'connectDeviceSms';
var PHONE_NUMBER = '14071234567';
const ALLOWED_PHONE_NUMBER = '13133249901';

// Override limit values for testing
const config = require('../../lib/config').getProperties();
config.limits.smsRateLimit.limitIntervalSeconds = 1;
config.limits.smsRateLimit.maxSms = 2;
config.limits.ipRateLimitIntervalSeconds = 1;
config.limits.ipRateLimitBanDurationSeconds = 1;
config.limits.rateLimitIntervalSeconds = 1;
config.allowedPhoneNumbers = [ALLOWED_PHONE_NUMBER];

var mcHelper = require('../memcache-helper');

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

test('/check `connectDeviceSms` by number', function(t) {
  // Send requests until throttled
  return (
    client
      .postAsync('/check', {
        ip: TEST_IP,
        email: 'test1@example.com',
        payload: { phoneNumber: PHONE_NUMBER },
        action: CONNECT_DEVICE_SMS,
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, false, 'not rate limited');
        return client.postAsync('/check', {
          ip: TEST_IP2,
          email: 'test2@example.com',
          payload: { phoneNumber: PHONE_NUMBER },
          action: CONNECT_DEVICE_SMS,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, false, 'not rate limited');
        return client.postAsync('/check', {
          ip: TEST_IP3,
          email: 'test3@example.com',
          payload: { phoneNumber: PHONE_NUMBER },
          action: CONNECT_DEVICE_SMS,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, true, 'rate limited');
        t.equal(obj.retryAfter, 1, 'rate limit retry amount');

        // If sms number rate limited, user can still perform other actions
        return client.postAsync('/check', {
          ip: TEST_IP3,
          email: 'test4@example.com',
          action: 'anotherAction',
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, false, 'not rate limited');

        // Issuing request for another ip address to the same phone number is still rate limited
        return client.postAsync('/check', {
          ip: TEST_IP4,
          email: 'test5@example.com',
          payload: { phoneNumber: PHONE_NUMBER },
          action: CONNECT_DEVICE_SMS,
        });
      })
      // Reissue requests to verify that throttling is disabled
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, true, 'rate limited');
        t.equal(obj.retryAfter, 1, 'rate limit retry amount');

        // Delay ~1s for rate limit to go away
        return Promise.delay(1010);
      })
      .then(function() {
        // Issuing request for another ip address to the same phone number is still rate limited
        return client.postAsync('/check', {
          ip: TEST_IP5,
          email: 'tes6@example.com',
          payload: { phoneNumber: PHONE_NUMBER },
          action: CONNECT_DEVICE_SMS,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, false, 'not rate limited');
        t.end();
      })
      .catch(function(err) {
        t.fail(err);
        t.end();
      })
  );
});

test('/check `connectDeviceSms` by allowed phone number', function(t) {
  // synthesize sending a bunch of SMS to the same phone number
  // from the same IP address, much like functional tests.
  // The IP address and the phone number would both be rate
  // limited by default, but the phone number is allowed.
  return client
    .postAsync('/check', {
      ip: TEST_IP,
      email: 'test1@example.com',
      payload: { phoneNumber: ALLOWED_PHONE_NUMBER },
      action: CONNECT_DEVICE_SMS,
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'returns a 200');
      t.equal(obj.block, false, 'not rate limited');
      return client.postAsync('/check', {
        ip: TEST_IP,
        email: 'test2@example.com',
        payload: { phoneNumber: ALLOWED_PHONE_NUMBER },
        action: CONNECT_DEVICE_SMS,
      });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'returns a 200');
      t.equal(obj.block, false, 'not rate limited');
      return client.postAsync('/check', {
        ip: TEST_IP,
        email: 'test3@example.com',
        payload: { phoneNumber: ALLOWED_PHONE_NUMBER },
        action: CONNECT_DEVICE_SMS,
      });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'returns a 200');
      t.equal(obj.block, false, 'not rate limited');
      return client.postAsync('/check', {
        ip: TEST_IP,
        email: 'test5@example.com',
        payload: { phoneNumber: ALLOWED_PHONE_NUMBER },
        action: CONNECT_DEVICE_SMS,
      });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'returns a 200');
      t.equal(obj.block, false, 'not rate limited');
      return client.postAsync('/check', {
        ip: TEST_IP,
        email: 'tes6@example.com',
        payload: { phoneNumber: ALLOWED_PHONE_NUMBER },
        action: CONNECT_DEVICE_SMS,
      });
    })
    .spread(function(req, res, obj) {
      t.equal(res.statusCode, 200, 'returns a 200');
      t.equal(obj.block, false, 'not rate limited');
      t.end();
    })
    .catch(function(err) {
      t.fail(err);
      t.end();
    });
});

test('/check `connectDeviceSms` by ip', function(t) {
  // Send requests until throttled
  return (
    client
      .postAsync('/check', {
        ip: TEST_IP4,
        email: 'test1@example.com',
        payload: { phoneNumber: '1111111111' },
        action: CONNECT_DEVICE_SMS,
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, false, 'not rate limited');
        return client.postAsync('/check', {
          ip: TEST_IP4,
          email: 'test2@example.com',
          payload: { phoneNumber: '1111111111' },
          action: CONNECT_DEVICE_SMS,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, false, 'not rate limited');
        return client.postAsync('/check', {
          ip: TEST_IP4,
          email: 'test3@example.com',
          payload: { phoneNumber: '3111111111' },
          action: CONNECT_DEVICE_SMS,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, true, 'rate limited');
        t.equal(obj.retryAfter, 1, 'rate limit retry amount');

        // Issue request from new ip address to verify that user is not block from performing another action on
        // another ip
        return client.postAsync('/check', {
          ip: TEST_IP3,
          email: 'test4@example.com',
          action: 'anotherAction',
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, false, 'rate limited');

        // Verify that user is still block at the ip level from issuing any more sms requests
        return client.postAsync('/check', {
          ip: TEST_IP4,
          email: 'test5@example.com',
          payload: { phoneNumber: '4111111111' },
          action: CONNECT_DEVICE_SMS,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, true, 'rate limited');
        t.equal(obj.retryAfter, 1, 'rate limit retry amount');

        // Delay ~1s for rate limit to go away
        return Promise.delay(1010);
      })

      // Reissue requests to verify that throttling is disabled
      .then(function() {
        return client.postAsync('/check', {
          ip: TEST_IP4,
          email: 'test6@example.com',
          payload: { phoneNumber: '5111111111' },
          action: CONNECT_DEVICE_SMS,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, false, 'not rate limited');
        t.end();
      })
      .catch(function(err) {
        t.fail(err);
        t.end();
      })
  );
});

test('/check `connectDeviceSms` by email', function(t) {
  // Send requests until throttled
  return (
    client
      .postAsync('/check', {
        ip: TEST_IP,
        email: 'test1@example.com',
        payload: { phoneNumber: '1111111111' },
        action: CONNECT_DEVICE_SMS,
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, false, 'not rate limited');
        return client.postAsync('/check', {
          ip: TEST_IP2,
          email: 'test1@example.com',
          payload: { phoneNumber: '1111111112' },
          action: CONNECT_DEVICE_SMS,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, false, 'not rate limited');
        return client.postAsync('/check', {
          ip: TEST_IP3,
          email: 'test1@example.com',
          payload: { phoneNumber: '1111111113' },
          action: CONNECT_DEVICE_SMS,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, true, 'rate limited');
        t.equal(obj.retryAfter, 1, 'rate limit retry amount');

        // Issue request for another action to verify not blocked
        return client.postAsync('/check', {
          ip: TEST_IP3,
          email: 'test1@example.com',
          action: 'anotherAction',
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, false, 'rate limited');

        // Verify that user is still block at the email level from issuing any more sms requests
        return client.postAsync('/check', {
          ip: TEST_IP5,
          email: 'test1@example.com',
          payload: { phoneNumber: '1111111114' },
          action: CONNECT_DEVICE_SMS,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, true, 'rate limited');
        t.equal(obj.retryAfter, 1, 'rate limit retry amount');

        // Delay ~1s for rate limit to go away
        return Promise.delay(1010);
      })

      // Reissue requests to verify that throttling is disabled
      .then(function() {
        return client.postAsync('/check', {
          ip: TEST_IP6,
          email: 'test1@example.com',
          payload: { phoneNumber: '1111111115' },
          action: CONNECT_DEVICE_SMS,
        });
      })
      .spread(function(req, res, obj) {
        t.equal(res.statusCode, 200, 'returns a 200');
        t.equal(obj.block, false, 'not rate limited');
        t.end();
      })
      .catch(function(err) {
        t.fail(err);
        t.end();
      })
  );
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
