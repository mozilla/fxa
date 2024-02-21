/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict';

const restifyClients = require('restify-clients');
const { randomIp } = require('../utils');
const TestServer = require('../test_server');
const test = require('tap').test;

const IP = randomIp();
const ACTION = 'wibble';

const config = require('../../lib/config').getProperties();
const testServer = new TestServer(config);

const client = restifyClients.createJsonClient({
  url: 'http://localhost:' + config.listen.port,
});

test('startup', async function (t) {
  await testServer.start();
  t.type(testServer.server, 'object', 'test server was started');
  t.end();
});

test('with ip and action', (t) => {
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

test('missing action', (t) => {
  client.post('/checkIpOnly', { ip: IP }, (err, req, res, obj) => {
    t.equal(res.statusCode, 400, '/checkIpOnly should return a 400 response');
    t.end();
  });
});

test('missing ip', (t) => {
  client.post('/checkIpOnly', { action: ACTION }, (err, req, res, obj) => {
    t.equal(res.statusCode, 400, '/checkIpOnly should return a 400 response');
    t.end();
  });
});

test('teardown', async function (t) {
  await testServer.stop();
  t.end();
});
