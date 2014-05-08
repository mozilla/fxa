/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test
var emailRecord = require('../email_record')

function now() {
  return 1000 // old school
}

function simpleEmailRecord() {
  return new (emailRecord(500, 2, now))()
}

test(
  'isBlocked works',
  function (t) {
    var er = simpleEmailRecord()

    t.equal(er.isBlocked(), false, 'record has never been blocked')
    er.bk = 499
    t.equal(er.isBlocked(), false, 'blockedAt is older than block interval')
    er.bk = 501
    t.equal(er.isBlocked(), true, 'blockedAt is within the block interval')
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
  'block works',
  function (t) {
    var er = simpleEmailRecord()

    er.addHit()
    t.equal(er.isBlocked(), false, 'record is not blocked')
    t.equal(er.xs.length, 1, 'record has been emailed once')
    er.block()
    t.equal(er.isBlocked(), true, 'record is blocked')
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
  'retryAfter works',
  function (t) {
    var er = simpleEmailRecord()
    er.now = function () {
      return 10000
    }

    t.equal(er.retryAfter(), 0, 'unblocked records can be retried now')
    er.bk = 100
    t.equal(er.retryAfter(), 0, 'long expired blocks can be retried immediately')
    er.bk = 500
    t.equal(er.retryAfter(), 0, 'just expired blocks can be retried immediately')
    er.bk = 6000
    t.equal(er.retryAfter(), 5, 'unexpired blocks can be retried in a bit')
    t.end()
  }
)
