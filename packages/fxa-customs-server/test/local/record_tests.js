/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const test = require('tap').test;
const Promise = require('bluebird');
const Record = require('../../lib/record');

function now() {
  return 240 * 1000;
}

const ACTION_NAME = 'verifyTotpCode';
const INVALID_ACTION = 'imNotValidAction';

const config = {
  actions: [ACTION_NAME],
  limits: {
    max: 2,
    periodMs: 1000,
    rateLimitIntervalMs: 1000,
  },
};

test('constructor', (t) => {
  const record = new Record({}, config);
  t.equal(record.actions, config.actions, 'actions set');
  t.equal(record.limits, config.limits, 'limits set');
  t.end();
});

test('rate limit works', (t) => {
  const record = new Record({}, config, now);

  t.equal(record.isRateLimited(), false, 'record is not rate limited');
  record.rateLimit();
  t.equal(record.isRateLimited(), true, 'record is rate limited');
  record.rl = now() - 60 * 1000;
  t.equal(record.isRateLimited(), false, 'record is not rate limited');
  t.end();
});

test('updates rate limit with valid action', (t) => {
  const record = new Record({}, config);

  t.equal(record.isRateLimited(), false, 'record is not rate limited');
  record.update(ACTION_NAME);
  t.equal(record.isRateLimited(), false, 'record is not rate limited');
  record.update(ACTION_NAME);
  t.equal(record.isRateLimited(), false, 'record is not rate limited');

  const retryAfter = record.update(ACTION_NAME);
  t.equal(record.isRateLimited(), true, 'record is rate limited');
  t.equal(retryAfter, 1, 'retry after is set');

  return Promise.delay(1000).then(() => {
    t.equal(record.isRateLimited(), false, 'record is not rate limited');
    t.end();
  });
});

test('ignores rate limit with invalid action', (t) => {
  const record = new Record({}, config);

  t.equal(record.isRateLimited(), false, 'record is not rate limited');
  record.update(INVALID_ACTION);
  t.equal(record.isRateLimited(), false, 'record is not rate limited');
  record.update(INVALID_ACTION);
  t.equal(record.isRateLimited(), false, 'record is not rate limited');
  record.update(INVALID_ACTION);
  t.equal(record.isRateLimited(), false, 'record is not rate limited');
  t.end();
});

test('getMinLifetimeMS works', (t) => {
  const record = new Record({}, config);
  t.equal(
    record.getMinLifetimeMS(),
    config.limits.rateLimitIntervalMs,
    'gets the min sms lifetime'
  );
  t.end();
});
