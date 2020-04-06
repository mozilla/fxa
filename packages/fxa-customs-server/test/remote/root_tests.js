/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test;
var restifyClients = require('restify-clients');
var TestServer = require('../test_server');
var packageJson = require('../../package.json');

var config = {
  listen: {
    port: 7000,
  },
};
var testServer = new TestServer(config);

test('startup', async function(t) {
  await testServer.start();
  t.type(testServer.server, 'object', 'test server was started');
  t.end();
});

var client = restifyClients.createJsonClient({
  url: 'http://127.0.0.1:' + config.listen.port,
});

test('version check', function(t) {
  client.get('/', function(err, req, res, obj) {
    t.notOk(err, 'good request is successful');
    t.equal(res.statusCode, 200, 'good request returns a 200');
    t.equal(
      obj.version,
      packageJson.version,
      'returns the correct version number'
    );
    t.end();
  });
});

test('teardown', async function(t) {
  await testServer.stop();
  t.end();
});
