/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const { assert } = require('chai');
const sinon = require('sinon');
const { test } = require('tap');

const log = {
  info: function () {},
  error: function () {},
};

const banHandler = require('../../lib/bans/handler');

const TEST_IP = '192.0.2.1';
const TEST_EMAIL = 'test@example.com';

const sandbox = sinon.createSandbox();

const records = {
  emailRecord: {
    block: sandbox.spy(),
  },
  ipRecord: {
    block: sandbox.spy(),
  },
};

const fetchRecords = sandbox.spy(() => Promise.resolve(records));
const setRecord = sandbox.spy(() => Promise.resolve());

test('well-formed ip blocking request', async () => {
  const message = {
    ban: {
      ip: TEST_IP,
    },
  };
  const handleBan = banHandler(fetchRecords, setRecord, log);
  await handleBan(message);
  assert.isTrue(records.ipRecord.block.calledOnce);
  assert.isTrue(setRecord.calledOnce);
  assert.deepEqual(setRecord.args[0][0], records.ipRecord);

  sandbox.reset();
});

test('well-formed email blocking request', async () => {
  const message = {
    ban: {
      email: TEST_EMAIL,
    },
  };
  const handleBan = banHandler(fetchRecords, setRecord, log);
  await handleBan(message);
  assert.isTrue(records.emailRecord.block.calledOnce);
  assert.isTrue(setRecord.calledOnce);
  assert.deepEqual(setRecord.args[0][0], records.emailRecord);

  sandbox.reset();
});

test('missing ip and email', async () => {
  const message = {
    ban: {},
  };
  const handleBan = banHandler(fetchRecords, setRecord, log);
  try {
    await handleBan(message);
    assert.fail();
  } catch (err) {
    assert.strictEqual(err, 'invalid message');
  }

  sandbox.reset();
});

test('missing ban', async () => {
  const message = {};
  const handleBan = banHandler(fetchRecords, setRecord, log);

  try {
    await handleBan(message);
    assert.fail();
  } catch (err) {
    assert.strictEqual(err, 'invalid message');
  }

  sandbox.reset();
});
