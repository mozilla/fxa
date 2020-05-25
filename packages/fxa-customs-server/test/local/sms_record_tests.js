/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test;
var smsRecord = require('../../lib/sms_record');

function now() {
  return 240 * 1000;
}
var limits = {
  smsRateLimitIntervalMs: 1000,
  maxSms: 1,
};

function simpleSMSRecord() {
  // eslint-disable-next-line space-unary-ops
  return new (smsRecord(limits, now))();
}

test('rate limit works', function (t) {
  var sr = simpleSMSRecord();

  t.equal(sr.isRateLimited(), false, 'record is not rate limited');
  sr.rateLimit();
  t.equal(sr.isRateLimited(), true, 'record is rate limited');
  sr.rl = now() - 60 * 1000;
  t.equal(sr.isRateLimited(), false, 'record is not rate limited');
  t.end();
});

test('retryAfter works', function (t) {
  var sr = simpleSMSRecord();
  var action = 'connectDeviceSms';

  sr.update(action);
  t.equal(sr.isRateLimited(), false, 'record is not rate limited');
  sr.update(action);
  t.equal(sr.isRateLimited(), true, 'record is rate limited');
  t.end();
});

test('parse works', function (t) {
  var sr = simpleSMSRecord();
  var copy1 = smsRecord(limits, now).parse(sr);

  t.equal(copy1.isRateLimited(), false, 'record is not rate limited');
  sr.rateLimit();
  t.equal(sr.isRateLimited(), true, 'original object is now rate limited');
  var copy2 = smsRecord(limits, now).parse(sr);
  t.equal(copy2.isRateLimited(), true, 'copied object is rate limited');
  t.end();
});

test('no action update works', function (t) {
  var sr = simpleSMSRecord();

  t.equal(sr.update(), 0, 'update with no action does nothing');
  t.end();
});

test('getMinLifetimeMS works', function (t) {
  var sr = simpleSMSRecord();

  t.equal(
    sr.getMinLifetimeMS(),
    limits.smsRateLimitIntervalMs,
    'gets the min sms lifetime'
  );
  t.end();
});
