/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test;
var TestServer = require('../test_server');
var Promise = require('bluebird');
var restifyClients = Promise.promisifyAll(require('restify-clients'));
var mcHelper = require('../memcache-helper');

const config = require('../../lib/config').getProperties();
config.updatePollIntervalSeconds = 1;

var testServer = new TestServer(config);

var client = restifyClients.createJsonClient({
  url: 'http://127.0.0.1:' + config.listen.port,
});

var IP = '10.0.0.5';
var EMAIL = 'test@example.com';

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

test('change limits', function(t) {
  var x = null;
  return client
    .getAsync('/limits')
    .spread(function(req, res, obj) {
      return obj.blockIntervalSeconds;
    })
    .then(function(bis) {
      x = bis;
      return mcHelper.setLimits({ blockIntervalSeconds: bis + 1 });
    })
    .then(function(settings) {
      t.equal(x + 1, settings.blockIntervalSeconds, 'helper sees the change');
      // Wait for background polling to detect the new value in memcache
      return Promise.delay(1010);
    })
    .then(function() {
      return client.getAsync('/limits');
    })
    .spread(function(req, res, obj) {
      t.equal(x + 1, obj.blockIntervalSeconds, 'server sees the change');
      t.end();
    })
    .catch(function(err) {
      t.fail(err);
      t.end();
    });
});

test('change nested limits', function(t) {
  var x = null;
  return client
    .getAsync('/limits')
    .spread(function(req, res, obj) {
      // This is derived from uidRateLimit.maxChecks
      return obj.maxChecksPerUid;
    })
    .then(function(mcpuid) {
      x = mcpuid;
      return mcHelper.setLimits({ uidRateLimit: { maxChecks: mcpuid + 1 } });
    })
    .then(function(settings) {
      t.equal(x + 1, settings.maxChecksPerUid, 'helper sees the change');
      // Wait for background polling to detect the new value in memcache
      return Promise.delay(1010);
    })
    .then(function() {
      return client.getAsync('/limits');
    })
    .spread(function(req, res, obj) {
      t.equal(x + 1, obj.maxChecksPerUid, 'server sees the change');
      t.end();
    })
    .catch(function(err) {
      t.fail(err);
      t.end();
    });
});

test('change allowedIPs', function(t) {
  var x = ['127.0.0.1'];
  return client
    .getAsync('/allowedIPs')
    .spread(function(req, res, obj) {
      t.ok(Array.isArray(obj));
      t.notDeepEqual(x, obj, 'allowedIPs are different');
      return mcHelper.setAllowedIPs(x);
    })
    .then(function(ips) {
      t.deepEqual(x, ips, 'helper sees the change');
      // Wait for background polling to detect the new value in memcache
      return Promise.delay(1010);
    })
    .then(function() {
      return client.getAsync('/allowedIPs');
    })
    .spread(function(req, res, obj) {
      t.deepEqual(x, obj, 'server sees the change');
      t.end();
    })
    .catch(function(err) {
      t.fail(err);
      t.end();
    });
});

test('change allowedEmailDomains', function(t) {
  var x = ['restmail.net'];
  return client
    .getAsync('/allowedEmailDomains')
    .spread(function(req, res, obj) {
      t.ok(Array.isArray(obj));
      t.notDeepEqual(x, obj, 'allowedEmailDomains are different');
      return mcHelper.setAllowedEmailDomains(x);
    })
    .then(function(ips) {
      t.deepEqual(x, ips, 'helper sees the change');
      // Wait for background polling to detect the new value in memcache
      return Promise.delay(1010);
    })
    .then(function() {
      return client.getAsync('/allowedEmailDomains');
    })
    .spread(function(req, res, obj) {
      t.deepEqual(x, obj, 'server sees the change');
      t.end();
    })
    .catch(function(err) {
      t.fail(err);
      t.end();
    });
});

test('change allowedPhoneNumbers', function(t) {
  var allowedPhoneNumbers = ['13133249901'];
  return client
    .getAsync('/allowedPhoneNumbers')
    .spread(function(req, res, obj) {
      t.ok(Array.isArray(obj));
      t.notDeepEqual(
        allowedPhoneNumbers,
        obj,
        'allowedPhoneNumbers are different'
      );
      return mcHelper.setAllowedPhoneNumbers(allowedPhoneNumbers);
    })
    .then(function(phoneNumbers) {
      t.deepEqual(allowedPhoneNumbers, phoneNumbers, 'helper sees the change');
      // Wait for background polling to detect the new value in memcache
      return Promise.delay(1010);
    })
    .then(function() {
      return client.getAsync('/allowedPhoneNumbers');
    })
    .spread(function(req, res, obj) {
      t.deepEqual(allowedPhoneNumbers, obj, 'server sees the change');
      t.end();
    })
    .catch(function(err) {
      t.fail(err);
      t.end();
    });
});

test('change requestChecks.treatEveryoneWithSuspicion', function(t) {
  return client
    .postAsync('/check', {
      ip: IP,
      email: EMAIL,
      action: 'accountCreate',
    })
    .spread(function(req, res, obj) {
      t.deepEqual(
        obj,
        {
          block: false,
          retryAfter: 0,
          suspect: false,
          unblock: true,
        },
        'request was not suspicious before the change'
      );
      return mcHelper.setRequestChecks({
        treatEveryoneWithSuspicion: true,
      });
    })
    .then(function() {
      return Promise.delay(1010);
    })
    .then(function() {
      return client.postAsync('/check', {
        ip: IP,
        email: EMAIL,
        action: 'accountCreate',
      });
    })
    .spread(function(req, res, obj) {
      t.deepEqual(
        obj,
        {
          block: false,
          retryAfter: 0,
          suspect: true,
          unblock: true,
        },
        'request was suspicious after the change'
      );
      return mcHelper.setRequestChecks({
        treatEveryoneWithSuspicion: false,
      });
    })
    .then(function() {
      t.end();
    });
});

test('change requestChecks.flowIdRequiredOnLogin', function(t) {
  return client
    .postAsync('/check', {
      ip: IP,
      email: EMAIL,
      action: 'accountLogin',
    })
    .spread(function(req, res, obj) {
      t.deepEqual(
        obj,
        {
          block: false,
          retryAfter: 0,
          suspect: true,
          unblock: true,
        },
        'request was not blocked'
      );
      return mcHelper.setRequestChecks({
        flowIdRequiredOnLogin: true,
      });
    })
    .then(function(ips) {
      return Promise.delay(1010);
    })
    .then(function() {
      return client.postAsync('/check', {
        ip: IP,
        email: EMAIL,
        action: 'accountLogin',
      });
    })
    .spread(function(req, res, obj) {
      t.deepEqual(
        obj,
        {
          block: true,
          retryAfter: 0,
          suspect: true,
          unblock: true,
        },
        'request was blocked after the change'
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
