/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict';

// Unit coverage for the reputation decision + fail-open logic, previously
// exercised only by the flaky check_reputation_tests.js. The ip client is fully
// stubbed, so boundaries and fail-open are deterministic (no I/O). FXA-13959.

const { assert } = require('chai');
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const { test } = require('tap');

const BLOCK_BELOW = 50;
const SUSPECT_BELOW = 60;

function build(overrides = {}) {
  const ipClient = {
    get: sinon.stub(),
    sendViolation: sinon.stub(),
  };
  const log = {
    info: sinon.spy(),
    error: sinon.spy(),
  };
  const config = {
    reputationService: Object.assign(
      {
        enable: true,
        enableCheck: true,
        blockBelow: BLOCK_BELOW,
        suspectBelow: SUSPECT_BELOW,
        baseUrl: 'http://127.0.0.1:9009',
        hawkId: 'root',
        hawkKey: 'toor',
        timeout: 25,
      },
      overrides
    ),
  };
  const factory = proxyquire('../../lib/reputationService', {
    // Replace the real http client with our stub regardless of config.
    './ipReputationClient': function FakeIPReputationClient() {
      return ipClient;
    },
  });
  return { ipClient, log, service: factory(config, log) };
}

test('disabled service is inert (every method returns false)', (t) => {
  const { service } = build({ enable: false });
  assert.equal(service.isBlockBelow(10), false);
  assert.equal(service.isSuspectBelow(10), false);
  assert.equal(service.get('192.0.2.1'), false);
  assert.equal(service.report('192.0.2.1', 'action'), false);
  t.end();
});

test('enableCheck=false keeps checks inert but still reports violations', async (t) => {
  const { service, ipClient } = build({ enableCheck: false });
  ipClient.sendViolation.resolves({ statusCode: 200 });

  assert.equal(service.isBlockBelow(10), false, 'block check inert');
  assert.equal(service.isSuspectBelow(10), false, 'suspect check inert');
  assert.equal(service.get('192.0.2.1'), false, 'get inert');

  await service.report('192.0.2.1', 'fxa:action');
  assert.ok(ipClient.sendViolation.calledOnce, 'violation still sent');
  t.end();
});

test('isBlockBelow boundary', (t) => {
  const { service } = build();
  assert.equal(service.isBlockBelow(BLOCK_BELOW - 1), true, 'below → true');
  assert.equal(service.isBlockBelow(BLOCK_BELOW), false, 'at threshold → false');
  assert.equal(service.isBlockBelow(BLOCK_BELOW + 1), false, 'above → false');
  assert.equal(service.isBlockBelow(0), false, '0 reputation → false');
  t.end();
});

test('isSuspectBelow boundary', (t) => {
  const { service } = build();
  assert.equal(service.isSuspectBelow(SUSPECT_BELOW - 1), true, 'below → true');
  assert.equal(
    service.isSuspectBelow(SUSPECT_BELOW),
    false,
    'at threshold → false'
  );
  assert.equal(service.isSuspectBelow(SUSPECT_BELOW + 1), false, 'above → false');
  assert.equal(service.isSuspectBelow(0), false, '0 reputation → false');
  t.end();
});

test('get returns the reputation on a 200', async (t) => {
  const { service, ipClient, log } = build();
  ipClient.get.resolves({
    statusCode: 200,
    body: { reputation: 42 },
    timingPhases: { total: 1.5 },
  });

  const reputation = await service.get('192.0.2.1');
  assert.equal(reputation, 42);
  assert.ok(
    log.info.calledWithMatch({ op: 'fetchIPReputation', reputation: 42 }),
    'logs the fetched reputation'
  );
  t.end();
});

test('get returns null on a 404 (reputation not found)', async (t) => {
  const { service, ipClient, log } = build();
  ipClient.get.resolves({ statusCode: 404, body: {} });

  const reputation = await service.get('192.0.2.1');
  assert.equal(reputation, null);
  assert.ok(log.info.called, 'logs at info, not error');
  assert.notOk(log.error.called, 'a 404 is not an error');
  t.end();
});

test('get fails open (returns null) on a server error response', async (t) => {
  const { service, ipClient, log } = build();
  ipClient.get.resolves({ statusCode: 500, body: { error: 'boom' } });

  const reputation = await service.get('9.9.9.9');
  assert.equal(reputation, null, 'fails open so the action is not blocked');
  assert.ok(
    log.error.calledWithMatch({ op: 'fetchIPReputation', statusCode: 500 }),
    'logs the bad response at error'
  );
  t.end();
});

test('get fails open (returns null) when the client rejects (e.g. timeout)', async (t) => {
  const { service, ipClient, log } = build();
  ipClient.get.rejects(new Error('Request timeout'));

  const reputation = await service.get('192.0.2.1');
  assert.equal(reputation, null, 'a timeout must not block the action');
  assert.ok(
    log.error.calledWithMatch({ op: 'fetchIPReputation' }),
    'logs the failure'
  );
  t.end();
});

test('report logs info on success', async (t) => {
  const { service, ipClient, log } = build();
  ipClient.sendViolation.resolves({ statusCode: 200 });

  await service.report('192.0.2.1', 'fxa:request.check.block.login');
  assert.ok(ipClient.sendViolation.calledOnceWith('192.0.2.1'));
  assert.ok(
    log.info.calledWithMatch({ statusCode: 200 }),
    'logs the violation result'
  );
  assert.notOk(log.error.called);
  t.end();
});

test('report swallows errors and logs them', async (t) => {
  const { service, ipClient, log } = build();
  ipClient.sendViolation.rejects(new Error('network down'));

  // Must resolve, not throw — a failed violation report cannot break /check.
  await service.report('192.0.2.1', 'fxa:request.check.block.login');
  assert.ok(log.error.called, 'logs the failure');
  t.end();
});
