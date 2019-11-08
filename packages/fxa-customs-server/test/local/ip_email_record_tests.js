/* eslint-disable space-unary-ops */
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test;
var ipEmailRecord = require('../../lib/ip_email_record');

function now() {
  return 1000; // old school
}

function simpleIpEmailRecord() {
  var limits = {
    rateLimitIntervalMs: 500,
    maxBadLogins: 2,
  };
  return new (ipEmailRecord(limits, now))();
}

test('shouldBlock works', function(t) {
  var ier = simpleIpEmailRecord();

  t.equal(ier.shouldBlock(), false, 'record has never been blocked');
  ier.rl = 499;
  t.equal(
    ier.shouldBlock(),
    false,
    'blockedAt is older than rate-limit interval'
  );
  ier.rl = 501;
  t.equal(
    ier.shouldBlock(),
    true,
    'blockedAt is within the rate-limit interval'
  );
  t.end();
});

test('addBadLogin works', function(t) {
  var ier = simpleIpEmailRecord();

  t.equal(ier.lf.length, 0, 'record has never had a bad login');
  ier.addBadLogin();
  t.equal(ier.lf.length, 1, 'record has had one bad login');
  ier.addBadLogin();
  ier.addBadLogin();
  t.equal(ier.lf.length, 3, 'record has three bad logins');
  t.end();
});

test('rateLimit works', function(t) {
  var ier = simpleIpEmailRecord();

  ier.addBadLogin();
  t.equal(ier.shouldBlock(), false, 'record is not blocked');
  t.equal(ier.lf.length, 1, 'record has been emailed once');
  ier.rateLimit();
  t.equal(ier.shouldBlock(), true, 'record is blocked');
  t.equal(ier.lf.length, 0, 'record has an empty list of emails');
  t.end();
});

test('trimBadLogins enforces the bad login limit', function(t) {
  var ier = simpleIpEmailRecord();

  t.equal(ier.lf.length, 0, 'record has nothing to trim');
  ier.addBadLogin();
  ier.addBadLogin();
  ier.addBadLogin();
  ier.addBadLogin();
  t.equal(ier.lf.length, 4, 'record contains too many bad logins');
  ier.trimBadLogins(now());
  t.equal(ier.lf.length, 3, 'record has trimmed excess bad logins');
  t.end();
});

test('trimBadLogins evicts expired entries', function(t) {
  var ier = simpleIpEmailRecord();

  t.equal(ier.lf.length, 0, 'record has nothing to trim');
  ier.trimBadLogins(now());
  t.equal(ier.lf.length, 0, 'trimming did not do anything');
  ier.lf.push(400);
  ier.lf.push(400);
  ier.lf.push(now());
  t.equal(ier.lf.length, 3, 'record contains expired and fresh logins');
  ier.trimBadLogins(now());
  t.equal(ier.lf.length, 1, 'record has trimmed expired bad logins');
  t.end();
});

test('isOverBadLogins works', function(t) {
  var ier = simpleIpEmailRecord();

  t.equal(ier.isOverBadLogins(), false, 'record has never seen bad logins');
  ier.addBadLogin();
  t.equal(
    ier.isOverBadLogins(),
    false,
    'record has not reached the bad login limit'
  );
  ier.addBadLogin();
  ier.addBadLogin();
  t.equal(
    ier.isOverBadLogins(),
    true,
    'record has reached the bad login limit'
  );
  t.end();
});

test('retryAfter works', function(t) {
  var ier = simpleIpEmailRecord();
  ier.now = function() {
    return 10000;
  };

  t.equal(ier.retryAfter(), 0, 'unblocked records can be retried now');
  ier.rl = 100;
  t.equal(
    ier.retryAfter(),
    0,
    'long expired blocks can be retried immediately'
  );
  ier.rl = 500;
  t.equal(
    ier.retryAfter(),
    0,
    'just expired blocks can be retried immediately'
  );
  ier.rl = 6000;
  t.equal(ier.retryAfter(), 6, 'unexpired blocks can be retried in a bit');
  t.end();
});

test('unblockIfReset works', function(t) {
  var ier = simpleIpEmailRecord();

  t.equal(ier.lf.length, 0, 'record does not have any bad logins');
  t.equal(ier.rl, undefined, 'record is not blocked');
  ier.unblockIfReset(now());
  t.equal(ier.lf.length, 0, 'record still does not have any bad logins');
  t.equal(ier.rl, undefined, 'record is still not blocked');
  ier.rateLimit();
  ier.addBadLogin();
  t.equal(ier.lf.length, 1, 'record has one bad login');
  t.equal(ier.rl, now(), 'record is blocked');
  ier.unblockIfReset(500);
  t.equal(
    ier.lf.length,
    1,
    'bad logins are not cleared when resetting prior to blocking'
  );
  t.equal(
    ier.rl,
    now(),
    'record is not unblocked when resetting prior to blocking'
  );
  ier.unblockIfReset(2000);
  t.equal(
    ier.lf.length,
    0,
    'bad logins are cleared when resetting after blocking'
  );
  t.equal(
    ier.rl,
    undefined,
    'record is unblocked when resetting after blocking'
  );
  t.end();
});

test('parse works', function(t) {
  var ier = simpleIpEmailRecord();
  t.equal(ier.shouldBlock(), false, 'original object is not blocked');
  t.equal(ier.lf.length, 0, 'original object has no bad logins');
  var limits = {
    rateLimitIntervalMs: 50,
    maxBadLogins: 2,
  };
  var ierCopy1 = ipEmailRecord(limits, now).parse(ier);
  t.equal(ierCopy1.shouldBlock(), false, 'copied object is not blocked');
  t.equal(ierCopy1.lf.length, 0, 'copied object has no bad logins');

  ier.rateLimit();
  ier.addBadLogin();
  t.equal(ier.shouldBlock(), true, 'original object is now blocked');
  t.equal(ier.lf.length, 1, 'original object now has one bad login');

  var ierCopy2 = ipEmailRecord(limits, now).parse(ier);
  t.equal(ierCopy2.shouldBlock(), true, 'copied object is blocked');
  t.equal(ierCopy2.lf.length, 1, 'copied object has one bad login');
  t.end();
});

test('update works', function(t) {
  var ier = simpleIpEmailRecord();

  t.equal(ier.update(), 0, 'undefined action does nothing');
  t.equal(ier.update('bogusAction'), 0, 'bogus action does nothing');
  t.equal(ier.update('accountLogin'), 0, 'login action in a clean account');
  ier.addBadLogin();
  ier.addBadLogin();
  ier.addBadLogin();
  t.equal(ier.shouldBlock(), false, 'account is not blocked');
  t.equal(ier.update('accountLogin'), 1, 'action above the login limit');
  t.equal(ier.shouldBlock(), true, 'account is now blocked');
  t.equal(ier.update('accountLogin'), 1, 'login action in a blocked account');
  t.end();
});

test('getMinLifetimeMS works', function(t) {
  var limits = {
    rateLimitIntervalMs: 10,
    maxBadLogins: 2,
  };
  var ier = new (ipEmailRecord(limits, now))();
  t.equal(ier.getMinLifetimeMS(), 10, 'lifetime = rl interval');
  t.end();
});
