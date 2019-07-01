/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict';

const mcHelper = require('../memcache-helper');
const Promise = require('bluebird');
const restifyClients = require('restify-clients');
const test = require('tap').test;
const TestServer = require('../test_server');

const TEST_EMAIL = 'test@example.com';
const TEST_IP = '192.0.2.1';
const ALLOWED_EMAILS = [];
for (let i = 0; i < 3; ++i) {
  ALLOWED_EMAILS[i] = `test.${i}@restmail.net`;
}
const DISALLOWED_EMAILS = [];
for (let i = 0; i < 2; ++i) {
  DISALLOWED_EMAILS[i] = `test.${i}@example.com`;
}

process.env.MAX_VERIFY_CODES = '1';

var config = {
  listen: {
    port: 7000,
  },
};
var testServer = new TestServer(config);

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

var client = restifyClients.createJsonClient({
  url: 'http://127.0.0.1:' + config.listen.port,
});
Promise.promisifyAll(client, { multiArgs: true });

// NOTE: Leading semi-colon because ASI is funny.
['accountCreate', 'accountLogin', 'passwordChange'].forEach(function(action) {
  test('normal ' + action, function(t) {
    client.post(
      '/check',
      { email: TEST_EMAIL, ip: TEST_IP, action: action },
      function(err, req, res, obj) {
        t.notOk(err, 'good request is successful');
        t.equal(res.statusCode, 200, 'good request returns a 200');
        t.ok(obj, 'got an obj, make jshint happy');
        t.end();
      }
    );
  });
});

test('missing action', function(t) {
  client.post('/check', { email: TEST_EMAIL, ip: TEST_IP }, function(
    err,
    req,
    res,
    obj
  ) {
    t.equal(res.statusCode, 400, 'bad request returns a 400');
    t.type(obj.code, 'string', 'bad request returns an error code');
    t.type(obj.message, 'string', 'bad request returns an error message');
    t.end();
  });
});

test('missing email, ip and action', function(t) {
  client.post('/check', {}, function(err, req, res, obj) {
    t.equal(res.statusCode, 400, 'bad request returns a 400');
    t.type(obj.code, 'string', 'bad request returns an error code');
    t.type(obj.message, 'string', 'bad request returns an error message');
    t.end();
  });
});

test('allowed email addresses in /check do not block subsequent requests to /checkIpOnly', t => {
  return client
    .postAsync('/check', {
      email: ALLOWED_EMAILS[0],
      ip: TEST_IP,
      action: 'recoveryEmailVerifyCode',
    })
    .spread((req, res, obj) => {
      t.equal(res.statusCode, 200, '/check succeeded');
      t.equal(obj.block, false, 'request was not blocked');

      return client.postAsync('/check', {
        email: ALLOWED_EMAILS[1],
        ip: TEST_IP,
        action: 'recoveryEmailVerifyCode',
      });
    })
    .spread((req, res, obj) => {
      t.equal(res.statusCode, 200, '/check succeeded');
      t.equal(obj.block, false, 'request was not blocked');

      return client.postAsync('/check', {
        email: ALLOWED_EMAILS[2],
        ip: TEST_IP,
        action: 'recoveryEmailVerifyCode',
      });
    })
    .spread((req, res, obj) => {
      t.equal(res.statusCode, 200, '/check succeeded');
      t.equal(obj.block, false, 'request was not blocked');

      return client.postAsync('/checkIpOnly', {
        ip: TEST_IP,
        action: 'consumeSigninCode',
      });
    })
    .spread((req, res, obj) => {
      t.equal(res.statusCode, 200, '/checkIpOnly succeeded');
      t.equal(obj.block, false, 'request was not blocked');
    })
    .catch(err => t.fail(err))
    .then(() => t.end());
});

test('disallowed email addresses in /check do not block subsequent requests to /checkIpOnly', t => {
  return client
    .postAsync('/check', {
      email: DISALLOWED_EMAILS[0],
      ip: TEST_IP,
      action: 'recoveryEmailVerifyCode',
    })
    .spread((req, res, obj) => {
      t.equal(res.statusCode, 200, '/check succeeded');

      return client.postAsync('/check', {
        email: DISALLOWED_EMAILS[1],
        ip: TEST_IP,
        action: 'recoveryEmailVerifyCode',
      });
    })
    .spread((req, res, obj) => {
      t.equal(res.statusCode, 200, '/check succeeded');
      t.equal(obj.block, true, 'request was blocked');

      return client.postAsync('/checkIpOnly', {
        ip: TEST_IP,
        action: 'consumeSigninCode',
      });
    })
    .spread((req, res, obj) => {
      t.equal(res.statusCode, 200, '/checkIpOnly succeeded');
      t.equal(obj.block, false, 'request was not blocked');
    })
    .catch(err => t.fail(err))
    .then(() => t.end());
});

test('teardown', function(t) {
  testServer.stop();
  t.equal(testServer.server.killed, true, 'test server has been killed');
  t.end();
});
