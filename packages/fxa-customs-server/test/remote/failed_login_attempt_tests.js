/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test;
var restifyClients = require('restify-clients');
var TestServer = require('../test_server');
var mcHelper = require('../memcache-helper');

var TEST_EMAIL = 'test@example.com';
var TEST_IP = '192.0.2.1';

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

test('well-formed request', function(t) {
  client.post(
    '/failedLoginAttempt',
    { email: TEST_EMAIL, ip: TEST_IP },
    function(err, req, res, obj) {
      t.notOk(err, 'good request is successful');
      t.equal(res.statusCode, 200, 'good request returns a 200');
      t.ok(obj, 'got an obj, make jshint happy');
      t.end();
    }
  );
});

test('missing ip', function(t) {
  client.post('/failedLoginAttempt', { email: TEST_EMAIL }, function(
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

test('missing email and ip', function(t) {
  client.post('/failedLoginAttempt', {}, function(err, req, res, obj) {
    t.equal(res.statusCode, 400, 'bad request returns a 400');
    t.type(obj.code, 'string', 'bad request returns an error code');
    t.type(obj.message, 'string', 'bad request returns an error message');
    t.end();
  });
});

test('teardown', function(t) {
  testServer.stop();
  t.equal(testServer.server.killed, true, 'test server has been killed');
  t.end();
});
