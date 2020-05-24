/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test;
var restifyClients = require('restify-clients');
var TestServer = require('../test_server');
var mcHelper = require('../memcache-helper');

var TEST_EMAIL = 'test@example.com';
var TEST_IP = '192.0.2.1';

const config = require('../../lib/config').getProperties();
config.memcache.address = '128.0.0.1:12131';

var testServer = new TestServer(config);

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

var client = restifyClients.createJsonClient({
  url: 'http://localhost:' + config.listen.port,
});

test('request with disconnected memcache', function (t) {
  client.post(
    '/check',
    { email: TEST_EMAIL, ip: TEST_IP, action: 'someRandomAction' },
    function (err, req, res, obj) {
      t.equal(res.statusCode, 200, 'check worked');
      t.equal(obj.block, true, 'request was blocked');
      t.equal(obj.retryAfter, 900, 'retry after');
      t.end();
    }
  );
});

test('teardown', async function (t) {
  await testServer.stop();
  t.end();
});
