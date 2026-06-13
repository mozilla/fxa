/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict';

// Unit coverage for the hand-rolled iprepd client. The flaky "timing data
// present" assertion (subtest #4 of check_reputation_tests.js) lives here now,
// driven against an in-process server rather than a fixed-port stub. FXA-13959.

const { assert } = require('chai');
const http = require('http');
const { test } = require('tap');

const IPReputationClient = require('../../lib/ipReputationClient');

const TEST_IP = '192.0.2.1';

// In-process http server on an ephemeral port. `handler` gets (req, res, body)
// and responds. Returns the base url, the most recent request, and stop().
function startServer(handler) {
  return new Promise((resolve) => {
    const lastRequest = {};
    const server = http.createServer((req, res) => {
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => {
        lastRequest.method = req.method;
        lastRequest.url = req.url;
        lastRequest.headers = req.headers;
        lastRequest.body = Buffer.concat(chunks).toString();
        handler(req, res, lastRequest.body);
      });
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        serviceUrl: `http://127.0.0.1:${port}`,
        lastRequest,
        stop: () =>
          new Promise((res) => {
            server.closeAllConnections?.();
            server.close(res);
          }),
      });
    });
  });
}

function makeClient(serviceUrl, overrides = {}) {
  return new IPReputationClient(
    Object.assign(
      { serviceUrl, id: 'root', key: 'toor', timeout: 1000 },
      overrides
    )
  );
}

test('constructor requires serviceUrl, id and key', (t) => {
  assert.throws(() => new IPReputationClient(), /required/);
  assert.throws(() => new IPReputationClient({ id: 'a', key: 'b' }), /required/);
  assert.throws(
    () => new IPReputationClient({ serviceUrl: 'http://x', key: 'b' }),
    /required/
  );
  assert.doesNotThrow(
    () => new IPReputationClient({ serviceUrl: 'http://x', id: 'a', key: 'b' })
  );
  t.end();
});

test('rejects invalid IPv4 addresses without making a request', async (t) => {
  const client = makeClient('http://127.0.0.1:1');
  for (const bad of ['nope', '1.2.3', '1.2.3.4.5', '999.1.1.1', '', null]) {
    await client.get(bad).then(
      () => assert.fail(`should reject ${bad}`),
      (err) => assert.match(err.message, /Invalid IP/)
    );
  }
  t.end();
});

test('get returns status, parsed body, attaches ip, and float timing data', async (t) => {
  const server = await startServer((req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ reputation: 75, reviewed: false }));
  });
  const client = makeClient(server.serviceUrl);

  const response = await client.get(TEST_IP);
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.reputation, 75);
  assert.equal(response.body.ip, TEST_IP, 'attaches the queried ip to the body');

  assert.equal(typeof response.timingPhases.total, 'number');
  assert.isAbove(
    response.timingPhases.total,
    0,
    'timing total is a positive float (regression: integer ms could be 0)'
  );

  assert.equal(server.lastRequest.method, 'GET');
  assert.equal(server.lastRequest.url, `/type/ip/${TEST_IP}`);
  assert.match(
    server.lastRequest.headers.authorization,
    /^Hawk /,
    'signs the request with a Hawk Authorization header'
  );

  await server.stop();
  t.end();
});

test('get surfaces a 404 without throwing', async (t) => {
  const server = await startServer((req, res) => {
    res.writeHead(404).end('{}');
  });
  const client = makeClient(server.serviceUrl);

  const response = await client.get(TEST_IP);
  assert.equal(response.statusCode, 404);

  await server.stop();
  t.end();
});

test('update PUTs the reputation payload in iprepd shape', async (t) => {
  const server = await startServer((req, res) => {
    res.writeHead(200).end('{}');
  });
  const client = makeClient(server.serviceUrl);

  await client.update(TEST_IP, 30);
  assert.equal(server.lastRequest.method, 'PUT');
  assert.equal(server.lastRequest.url, `/type/ip/${TEST_IP}`);
  assert.deepEqual(JSON.parse(server.lastRequest.body), {
    reputation: 30,
    object: TEST_IP,
    type: 'ip',
  });

  await server.stop();
  t.end();
});

test('sendViolation PUTs to the violations path', async (t) => {
  const server = await startServer((req, res) => {
    res.writeHead(200).end('{}');
  });
  const client = makeClient(server.serviceUrl);

  await client.sendViolation(TEST_IP, 'fxa:request.check.block.login');
  assert.equal(server.lastRequest.method, 'PUT');
  assert.equal(server.lastRequest.url, `/violations/type/ip/${TEST_IP}`);
  assert.deepEqual(JSON.parse(server.lastRequest.body), {
    violation: 'fxa:request.check.block.login',
    type: 'ip',
    object: TEST_IP,
  });

  await server.stop();
  t.end();
});

test('rejects with a timeout error when the server is too slow', async (t) => {
  // Server responds long after the client gives up — wide margin keeps this
  // deterministic instead of racing the clock.
  let timer;
  const server = await startServer((req, res) => {
    timer = setTimeout(() => res.writeHead(200).end('{}'), 5000);
  });
  const client = makeClient(server.serviceUrl, { timeout: 50 });

  await client.get(TEST_IP).then(
    () => assert.fail('should have timed out'),
    (err) => assert.match(err.message, /timeout/i)
  );

  clearTimeout(timer);
  await server.stop();
  t.end();
});
