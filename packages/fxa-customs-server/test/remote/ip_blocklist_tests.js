/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test;
var Promise = require('bluebird');
var restifyClients = Promise.promisifyAll(require('restify-clients'));
var TestServer = require('../test_server');
var mcHelper = require('../memcache-helper');

var TEST_EMAIL = 'test@example.com';
var ACTION = 'dummyAction';
var BLOCK_IP = '1.93.0.224';
var LOG_ONLY_BOTH_LIST_IP = '1.93.0.225';
var LOG_ONLY_IP = '86.75.30.9';
var BLOCK_IP_INRANGE = '0.1.0.0';
var VALID_IP = '3.0.0.0';
const ENDPOINTS = ['/check', '/checkIpOnly'];

const config = require('../../lib/config').getProperties();
config.ipBlocklist.enable = true;
config.ipBlocklist.lists = ['./test/mocks/simple.netset'];
config.ipBlocklist.logOnlyLists = ['./test/mocks/logOnlyList.netset'];

var testServer = new TestServer(config);

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

var client = restifyClients.createJsonClient({
  url: 'http://localhost:' + config.listen.port,
});

Promise.promisifyAll(client, { multiArgs: true });

ENDPOINTS.forEach(endpoint => {
  test(`${endpoint} block ip from ip blocklist`, t => {
    client.postAsync(
      endpoint,
      { ip: BLOCK_IP, email: TEST_EMAIL, action: ACTION },
      function(err, req, res, obj) {
        t.equal(obj.block, true, 'request is blocked');
        t.end();
      }
    );
  });

  test(`${endpoint} block ip in range of blocklist`, t => {
    client.postAsync(
      endpoint,
      { ip: BLOCK_IP_INRANGE, email: TEST_EMAIL, action: ACTION },
      function(err, req, res, obj) {
        t.equal(obj.block, true, 'request is blocked');
        t.equal(obj.blockReason, 'ip_in_blocklist', 'blockReason set');
        t.end();
      }
    );
  });

  test(`${endpoint} do not block ip not in range blocklist`, t => {
    client.postAsync(
      endpoint,
      { ip: VALID_IP, email: TEST_EMAIL, action: ACTION },
      function(err, req, res, obj) {
        t.equal(obj.block, false, 'request is not blocked');
        t.end();
      }
    );
  });

  test(`${endpoint} should log only on hit from logOnly list`, t => {
    client.postAsync(
      endpoint,
      { ip: LOG_ONLY_IP, email: TEST_EMAIL, action: ACTION },
      function(err, req, res, obj) {
        t.equal(obj.block, false, 'request is not blocked');
        t.end();
      }
    );
  });

  test(`${endpoint} should block request on hit from logOnly and blocklist`, t => {
    client.postAsync(
      endpoint,
      { ip: LOG_ONLY_BOTH_LIST_IP, email: TEST_EMAIL, action: ACTION },
      function(err, req, res, obj) {
        t.equal(obj.block, true, 'request is blocked');
        t.end();
      }
    );
  });
});

test('teardown', async function(t) {
  await testServer.stop();
  t.end();
});
