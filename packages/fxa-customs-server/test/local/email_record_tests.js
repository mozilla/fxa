/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

require('ass')
var test = require('tap').test
var emailRecord = require('../../email_record')

function now() {
  return 1000 // old school
}

function simpleEmailRecord() {
  return new (emailRecord(500, 800, 1600, 2, 5, now))()
}

test(
  'shouldBlock works',
  function (t) {
    var er = simpleEmailRecord()

    t.equal(er.shouldBlock(), false, 'record has never been blocked')
    er.rl = 499
    t.equal(er.shouldBlock(), false, 'blockedAt is older than rate-limit interval')
    er.rl = 501
    t.equal(er.shouldBlock(), true, 'blockedAt is within the rate-limit interval')
    delete er.rl
    t.equal(er.shouldBlock(), false, 'record is no longer blocked')

    er.bk = 199
    t.equal(er.shouldBlock(), false, 'blockedAt is older than block interval')
    er.bk = 201
    t.equal(er.shouldBlock(), true, 'blockedAt is within the block interval')
    t.end()
  }
)

test(
  'addHit works',
  function (t) {
    var er = simpleEmailRecord()

    t.equal(er.xs.length, 0, 'record has never been emailed')
    er.addHit()
    t.equal(er.xs.length, 1, 'record has been emailed once')
    er.addHit()
    er.addHit()
    t.equal(er.xs.length, 3, 'record has been emailed three times')
    t.end()
  }
)

test(
  'rateLimit works',
  function (t) {
    var er = simpleEmailRecord()

    er.addHit()
    t.equal(er.shouldBlock(), false, 'record is not blocked')
    t.equal(er.xs.length, 1, 'record has been emailed once')
    er.rateLimit()
    t.equal(er.shouldBlock(), true, 'record is blocked')
    t.equal(er.xs.length, 0, 'record has an empty list of emails')
    t.end()
  }
)

test(
  'trimHits enforces the email limit',
  function (t) {
    var er = simpleEmailRecord()

    t.equal(er.xs.length, 0, 'record has nothing to trim')
    er.addHit()
    er.addHit()
    er.addHit()
    er.addHit()
    t.equal(er.xs.length, 4, 'record contains too many emails')
    er.trimHits(now())
    t.equal(er.xs.length, 3, 'record has trimmed excess emails')
    t.end()
  }
)

test(
  'trimHits evicts expired entries',
  function (t) {
    var er = simpleEmailRecord()

    t.equal(er.xs.length, 0, 'record has nothing to trim')
    er.trimHits(now())
    t.equal(er.xs.length, 0, 'trimming did not do anything')
    er.xs.push(400)
    er.xs.push(400)
    er.xs.push(now())
    t.equal(er.xs.length, 3, 'record contains expired and fresh emails')
    er.trimHits(now())
    t.equal(er.xs.length, 1, 'record has trimmed expired emails')
    t.end()
  }
)

test(
  'isOverEmailLimit works',
  function (t) {
    var er = simpleEmailRecord()

    t.equal(er.isOverEmailLimit(), false, 'record has never been emailed')
    er.addHit()
    t.equal(er.isOverEmailLimit(), false, 'record has not reached the email limit')
    er.addHit()
    er.addHit()
    t.equal(er.isOverEmailLimit(), true, 'record has reached the email limit')
    t.end()
  }
)

test(
  'isWayOverBadLogins works',
  function (t) {
    var er = simpleEmailRecord()

    t.equal(er.isWayOverBadLogins(), false, 'record has never seen a bad login')
    er.addBadLogin()
    er.addBadLogin()
    er.addBadLogin()
    er.addBadLogin()
    t.equal(er.isWayOverBadLogins(), false, 'record has not reached the bad login limit')
    er.addBadLogin()
    er.addBadLogin()
    t.equal(er.isWayOverBadLogins(), true, 'record has reached the bad login limit')
    t.end()
  }
)

test(
  'retryAfter works',
  function (t) {
    var er = new (emailRecord(5000, 8000, 16000, 2, 5, function () {
      return 10000
    }))()

    t.equal(er.retryAfter(), 0, 'unblocked records can be retried now')
    er.rl = 1000
    t.equal(er.retryAfter(), 0, 'long expired blocks can be retried immediately')
    er.rl = 5000
    t.equal(er.retryAfter(), 0, 'just expired blocks can be retried immediately')
    er.rl = 6000
    t.equal(er.retryAfter(), 1, 'unexpired blocks can be retried in a bit')

    delete er.rl
    t.equal(er.retryAfter(), 0, 'unblocked records can be retried now')
    er.bk = 1000
    t.equal(er.retryAfter(), 0, 'long expired blocks can be retried immediately')
    er.bk = 2000
    t.equal(er.retryAfter(), 0, 'just expired blocks can be retried immediately')
    er.bk = 6000
    t.equal(er.retryAfter(), 4, 'unexpired blocks can be retried in a bit') // TODO?
    t.end()
  }
)

test(
  'passwordReset works',
  function (t) {
    var er = simpleEmailRecord()

    t.equal(er.pr, undefined, 'password is not marked as reset yet')
    er.passwordReset()
    t.equal(er.pr, 1000, 'password is marked as reset now')
    t.end()
  }
)

test(
  'parse works',
  function (t) {
    var er = simpleEmailRecord()
    t.equal(er.shouldBlock(), false, 'original object is not blocked')
    t.equal(er.xs.length, 0, 'original object has no hits')

    var erCopy1 = (emailRecord(50, 50, 100, 2, 5, now)).parse(er)
    t.equal(erCopy1.shouldBlock(), false, 'copied object is not blocked')
    t.equal(erCopy1.xs.length, 0, 'copied object has no hits')

    er.rateLimit()
    er.addHit()
    t.equal(er.shouldBlock(), true, 'original object is now blocked')
    t.equal(er.xs.length, 1, 'original object now has one hit')

    var erCopy2 = (emailRecord(50, 50, 100, 2, 5, now)).parse(er)
    t.equal(erCopy2.shouldBlock(), true, 'copied object is blocked')
    t.equal(erCopy2.xs.length, 1, 'copied object has one hit')
    t.end()
  }
)

test(
  'update works',
  function (t) {
    var er = simpleEmailRecord()

    t.equal(er.update('bogusAction'), 0, 'bogus email actions does nothing')
    t.equal(er.update('accountCreate'), 0, 'email action in a clean account')
    er.addHit()
    er.addHit()
    er.addHit()
    t.equal(er.shouldBlock(), false, 'account is not blocked')
    t.equal(er.update('accountCreate'), 0, 'email action above the email limit')
    t.equal(er.shouldBlock(), true, 'account is now blocked')
    t.equal(er.update('accountCreate'), 0, 'email action in a blocked account')

    er.rl = 2000
    t.equal(er.shouldBlock(), true, 'account is blocked due to rate limiting')
    t.equal(er.isBlocked(), false, 'account is not outright banned')
    t.equal(er.isRateLimited(), true, 'account is rate limited')
    t.equal(er.update('accountCreate'), 1, 'email action is blocked')
    t.equal(er.update('accountLogin'), 0, 'non-email action is not blocked')
    er.rl = 0
    er.bk = 2000
    t.equal(er.shouldBlock(), true, 'account is blocked due to being outright blocked')
    t.equal(er.isBlocked(), true, 'account is outright banned')
    t.equal(er.isRateLimited(), false, 'account is not rate limited')
    t.equal(er.update('accountCreate'), 1, 'email action is blocked')
    t.equal(er.update('accountLogin'), 1, 'non-email action is blocked')

    t.end()
  }
)
