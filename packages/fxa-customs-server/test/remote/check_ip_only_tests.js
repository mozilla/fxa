/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict';

const memcached = require('../memcache-helper');
const restifyClients = require('restify-clients');
const test = require('tap').test;
const TestServer = require('../test_server');

const IP = '192.168.1.1';
const ACTION = 'wibble';

const config = {
  listen: {
    port: 7000,
  },
};

const testServer = new TestServer(config);

const client = restifyClients.createJsonClient({
  url: 'http://127.0.0.1:' + config.listen.port,
});

test('startup', t => {
  testServer.start(err => {
    t.type(
      testServer.server,
      'object',
      'testServer.server should be an object'
    );
    t.notOk(err, 'testServer.start should not return an error');
    t.end();
  });
});

test('clear everything', t => {
  memcached.clearEverything(err => {
    t.notOk(err, 'memcached.clearEverything should not return an error');
    t.end();
  });
});

test('with ip and action', t => {
  client.post(
    '/checkIpOnly',
    { ip: IP, action: ACTION },
    (err, req, res, obj) => {
      t.notOk(err, '/checkIpOnly should not return an error');
      t.equal(res.statusCode, 200, '/checkIpOnly should return a 200 response');
      t.type(obj, 'object', '/checkIpOnly should return an object');
      t.end();
    }
  );
});

test('missing action', t => {
  client.post('/checkIpOnly', { ip: IP }, (err, req, res, obj) => {
    t.equal(res.statusCode, 400, '/checkIpOnly should return a 400 response');
    t.end();
  });
});

test('missing ip', t => {
  client.post('/checkIpOnly', { action: ACTION }, (err, req, res, obj) => {
    t.equal(res.statusCode, 400, '/checkIpOnly should return a 400 response');
    t.end();
  });
});

test('teardown', t => {
  testServer.stop();
  t.equal(
    testServer.server.killed,
    true,
    'testServer.server.killed should be true'
  );
  t.end();
});
