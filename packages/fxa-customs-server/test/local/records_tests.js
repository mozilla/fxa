/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const { assert } = require('chai');
const sinon = require('sinon');
const { test } = require('tap');

const sandbox = sinon.createSandbox();

const mc = {
  getAsync: sandbox.spy(() => Promise.resolve({})),
  setAsync: sandbox.spy(() => Promise.resolve()),
};

const reputationService = {
  get: sandbox.spy(() => Promise.resolve({})),
};

const limits = {};

const recordLifetimeSeconds = 1;

var { fetchRecords, setRecords, setRecord } = require('../../lib/records')(
  mc,
  reputationService,
  limits,
  recordLifetimeSeconds
);

test('fetchRecords', function(t) {
  return fetchRecords({
    ip: 'ip address',
    email: 'email address',
    phoneNumber: 'phone number',
    uid: 'uid',
  }).then(records => {
    assert.strictEqual(mc.getAsync.callCount, 5);
    assert.strictEqual(mc.getAsync.args[0][0], 'ip address');
    assert.strictEqual(mc.getAsync.args[1][0], 'email address');
    assert.strictEqual(mc.getAsync.args[2][0], 'ip addressemail address');
    assert.strictEqual(mc.getAsync.args[3][0], 'phone number');
    assert.strictEqual(mc.getAsync.args[4][0], 'uid');

    assert.lengthOf(Object.keys(records), 6);
    assert.isObject(records.ipRecord);
    assert.deepEqual(records.ipRecord.key, 'ip address');

    assert.isObject(records.reputation);

    assert.isObject(records.emailRecord);
    assert.strictEqual(records.emailRecord.key, 'email address');

    assert.isObject(records.ipEmailRecord);
    assert.strictEqual(records.ipEmailRecord.key, 'ip addressemail address');

    assert.isObject(records.smsRecord);
    assert.strictEqual(records.smsRecord.key, 'phone number');

    assert.isObject(records.uidRecord);
    assert.strictEqual(records.uidRecord.key, 'uid');

    sandbox.reset();
  });
});

test('setRecord', function(t) {
  const record = {
    key: 'key',
    getMinLifetimeMS: () => 5000,
    value: 'record',
  };

  return setRecord(record).then(result => {
    assert.strictEqual(mc.setAsync.callCount, 1);
    assert.strictEqual(mc.setAsync.args[0][0], 'key');
    assert.deepEqual(mc.setAsync.args[0][1], { value: 'record' });
    assert.strictEqual(mc.setAsync.args[0][2], 5);
    sandbox.reset();
  });
});

test('setRecords', function(t) {
  const ipRecord = {
    key: 'ip address',
    getMinLifetimeMS: () => 5000,
    value: 'ip record',
  };
  const emailRecord = {
    key: 'email address',
    getMinLifetimeMS: () => 5000,
    value: 'email record',
  };
  const ipEmailRecord = {
    key: 'ip addressemail address',
    getMinLifetimeMS: () => 5000,
    value: 'ip email record',
  };
  const smsRecord = {
    key: 'phone number',
    getMinLifetimeMS: () => 5000,
    value: 'sms record',
  };
  const userDefinedRecord = {
    key: 'user defined key',
    getMinLifetimeMS: () => 5000,
    value: 'user defined record',
  };
  Object.defineProperty(userDefinedRecord, 'not_saved', {
    enumerable: false,
    get() {
      return 'not-saved-value';
    },
  });

  return setRecords(
    ipRecord,
    emailRecord,
    ipEmailRecord,
    smsRecord,
    userDefinedRecord
  ).then(records => {
    assert.strictEqual(mc.setAsync.callCount, 5);
    assert.strictEqual(mc.setAsync.args[0][0], 'ip address');
    assert.deepEqual(mc.setAsync.args[0][1], { value: 'ip record' });

    assert.strictEqual(mc.setAsync.args[1][0], 'email address');
    assert.deepEqual(mc.setAsync.args[1][1], { value: 'email record' });

    assert.strictEqual(mc.setAsync.args[2][0], 'ip addressemail address');
    assert.deepEqual(mc.setAsync.args[2][1], { value: 'ip email record' });

    assert.strictEqual(mc.setAsync.args[3][0], 'phone number');
    assert.deepEqual(mc.setAsync.args[3][1], { value: 'sms record' });

    assert.strictEqual(mc.setAsync.args[4][0], 'user defined key');
    assert.deepEqual(mc.setAsync.args[4][1], { value: 'user defined record' });

    sandbox.reset();
  });
});
