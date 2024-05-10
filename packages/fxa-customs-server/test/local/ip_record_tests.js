/* eslint-disable space-unary-ops */
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test;
var ipRecord = require('../../lib/ip_record');

function now() {
  return 240 * 1000; // old school
}

function simpleIpRecord() {
  var limits = {
    suspectIntervalMs: 110000,
    blockIntervalMs: 120000,
    disableIntervalMs: 130000,
    ipRateLimitIntervalMs: 1000,
    ipRateLimitBanDurationMs: 1000,
    maxBadLoginsPerIp: 3,
    maxAccountStatusCheck: 1,
    badLoginErrnoWeights: { '102': 2 },
  };
  return new (ipRecord(limits, now))();
}

test('shouldBlock works', function (t) {
  var ir = simpleIpRecord();

  t.equal(ir.shouldBlock(), false, 'record has never been blocked');
  ir.bk = now();
  t.equal(ir.shouldBlock(), true, 'record is blocked');
  ir.bk = now() - 60 * 1000;
  t.equal(ir.shouldBlock(), true, 'record is still blocked');
  ir.bk = now() - 120 * 1000; // blockInterval
  t.equal(ir.shouldBlock(), false, 'record is no longer blocked');

  ir.di = now() - 129999;
  t.equal(ir.shouldBlock(), true);
  ir.di = now() - 130000;
  t.equal(ir.shouldBlock(), false);

  t.end();
});

test('suspect', (t) => {
  const record = simpleIpRecord();
  t.equal(record.isSuspected(), false);

  record.suspect();
  t.equal(record.isSuspected(), true);

  t.end();
});

test('block', (t) => {
  const ir = simpleIpRecord();

  t.equal(ir.shouldBlock(), false);
  t.equal(ir.isBlocked(), false);

  ir.block();
  t.equal(ir.shouldBlock(), true);
  t.equal(ir.isBlocked(), true);

  t.end();
});

test('disable', (t) => {
  const record = simpleIpRecord();
  t.equal(record.isDisabled(), false);

  record.disable();
  t.equal(record.isDisabled(), true);

  t.end();
});

test('rate limit works', function (t) {
  var ir = simpleIpRecord();

  t.equal(ir.isRateLimited(), false, 'record is not rate limited');
  ir.rateLimit();
  t.equal(ir.isRateLimited(), true, 'record is rate limited');
  ir.rl = now() - 60 * 1000;
  t.equal(ir.isRateLimited(), false, 'record is not rate limited');
  t.end();
});

test('retryAfter block works', function (t) {
  var ir = simpleIpRecord();

  t.equal(ir.retryAfter(), 0, 'unblocked records can be retried now');
  ir.bk = now() - 180 * 1000;
  t.equal(ir.retryAfter(), 0, 'long expired blocks can be retried immediately');
  ir.bk = now() - 120 * 1000;
  t.equal(ir.retryAfter(), 0, 'just expired blocks can be retried immediately');
  ir.bk = now() - 60 * 1000;
  t.equal(ir.retryAfter(), 60, 'unexpired blocks can be retried in a bit');
  t.end();
});

test('parse works', function (t) {
  var ir = simpleIpRecord();
  t.equal(ir.shouldBlock(), false, 'original object is not blocked');
  var limits = {
    blockIntervalMs: 120000,
    ipRateLimitIntervalMs: 90,
    ipRateLimitBanDurationMs: 90,
    maxBadLoginsPerIp: 2,
    maxAccountStatusCheck: 1,
    badLoginErrnoWeights: {},
  };
  var irCopy1 = ipRecord(limits, now).parse(ir);
  t.equal(irCopy1.shouldBlock(), false, 'copied object is not blocked');

  ir.block();
  t.equal(ir.shouldBlock(), true, 'original object is now blocked');
  var irCopy2 = ipRecord(limits, now).parse(ir);
  t.equal(irCopy2.shouldBlock(), true, 'copied object is blocked');
  t.end();
});

test('no action update works', function (t) {
  var ir = simpleIpRecord();
  t.equal(ir.update(), 0, 'update with no action does nothing');
  t.end();
});

test('action accountStatusCheck rate-limit works', function (t) {
  var ir = simpleIpRecord();
  ir.as = [];

  ir.update('accountStatusCheck', 'test1@example.com');
  t.equal(ir.retryAfter(), 0, 'rate-limit not exceeded');
  ir.update('accountStatusCheck', 'test1@example.com');
  t.equal(ir.retryAfter(), 0, 'rate-limit not exceeded using same email');
  ir.update('accountStatusCheck', 'test2@example.com');
  t.equal(ir.retryAfter(), 1, 'rate-limit exceeded using different email');
  t.end();
});

test('getMinLifetimeMS works', function (t) {
  var limits = {
    blockIntervalMs: 10,
    ipRateLimitIntervalMs: 15,
    ipRateLimitBanDurationMs: 20,
    maxBadLoginsPerIp: 2,
    maxAccountStatusCheck: 5,
    badLoginErrnoWeights: {},
  };
  var ir = new (ipRecord(limits, now))();
  t.equal(ir.getMinLifetimeMS(), 20, 'lifetime >= rl ban duration');
  limits = {
    blockIntervalMs: 11,
    ipRateLimitIntervalMs: 21,
    ipRateLimitBanDurationMs: 15,
    maxBadLoginsPerIp: 2,
    maxAccountStatusCheck: 5,
    badLoginErrnoWeights: {},
  };
  ir = new (ipRecord(limits, now))();
  t.equal(ir.getMinLifetimeMS(), 21, 'lifetime >= rl tracking interval');
  limits = {
    blockIntervalMs: 22,
    ipRateLimitIntervalMs: 15,
    ipRateLimitBanDurationMs: 12,
    maxBadLoginsPerIp: 2,
    maxAccountStatusCheck: 5,
    badLoginErrnoWeights: {},
  };
  ir = new (ipRecord(limits, now))();
  t.equal(ir.getMinLifetimeMS(), 22, 'lifetime >= block internal');
  t.end();
});

test('addBadLogins works per IP', function (t) {
  var ir = simpleIpRecord();
  ir.addBadLogin({ email: 'test1@example.com', errno: 999 });
  t.equal(ir.isOverBadLogins(), false, 'one record is not over');
  ir.addBadLogin({ email: 'test2@example.com', errno: 555 });
  ir.addBadLogin({ email: 'test3@example.com', errno: 444 });
  t.equal(ir.isOverBadLogins(), false, 'three records is not over');
  ir.addBadLogin({ email: 'test4@example.com', errno: 777 });
  t.equal(ir.isOverBadLogins(), true, 'four records is over');

  var ir2 = simpleIpRecord();
  ir2.addBadLogin({ email: 'test1@example.com', errno: 102 });
  t.equal(ir2.isOverBadLogins(), false, 'one unknown record is not over');
  ir2.addBadLogin({ email: 'test2@example.com', errno: 102 });
  t.equal(ir2.isOverBadLogins(), true, 'two unknown records is over');
  t.end();
});

test('isOverBadLogins counts max per unique email addresses', function (t) {
  var ir = simpleIpRecord();
  ir.addBadLogin({ email: 'test1@example.com' });
  ir.addBadLogin({ email: 'test1@example.com' });
  ir.addBadLogin({ email: 'test1@example.com' });
  ir.addBadLogin({ email: 'test1@example.com' });
  ir.addBadLogin({ email: 'test1@example.com' });
  t.equal(ir.isOverBadLogins(), false, 'one email does not put it over');

  ir.addBadLogin({ email: 'test2@example.com' });
  t.equal(ir.isOverBadLogins(), false, 'two emails does not put it over');

  ir.addBadLogin({ email: 'test3@example.com' });
  t.equal(ir.isOverBadLogins(), false, 'three emails does not put it over');

  ir.addBadLogin({ email: 'test1@example.com', errno: 102 });
  t.equal(
    ir.isOverBadLogins(),
    true,
    'extra score for first email puts it over'
  );

  t.end();
});
