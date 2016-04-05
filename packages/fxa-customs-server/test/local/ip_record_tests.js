/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

require('ass')
var test = require('tap').test
var ipRecord = require('../../lib/ip_record')

function now() {
  return 240 * 1000 // old school
}

function simpleIpRecord() {
  return new (ipRecord(
    120 * 1000,
    1 * 1000,
    1 * 1000,
    3,
    1,
    2,
    now))()
}

test(
  'shouldBlock works',
  function (t) {
    var ir = simpleIpRecord()

    t.equal(ir.shouldBlock(), false, 'record has never been blocked')
    ir.bk = now()
    t.equal(ir.shouldBlock(), true, 'record is blocked')
    ir.bk = now() - 60 * 1000
    t.equal(ir.shouldBlock(), true, 'record is still blocked')
    ir.bk = now() - 120 * 1000 // blockInterval
    t.equal(ir.shouldBlock(), false, 'record is no longer blocked')
    t.end()
  }
)

test(
  'block works',
  function (t) {
    var ir = simpleIpRecord()

    t.equal(ir.shouldBlock(), false, 'record has never been blocked')
    ir.block()
    t.equal(ir.shouldBlock(), true, 'record is blocked')
    t.end()
  }
)

test('rate limit works',
  function (t) {
    var ir = simpleIpRecord()

    t.equal(ir.isRateLimited(), false, 'record is not rate limited')
    ir.rateLimit()
    t.equal(ir.isRateLimited(), true, 'record is rate limited')
    ir.rl = now() - 60 * 1000
    t.equal(ir.isRateLimited(), false, 'record is not rate limited')
    t.end()
  }
)

test(
  'retryAfter block works',
  function (t) {
    var ir = simpleIpRecord()

    t.equal(ir.retryAfter(), 0, 'unblocked records can be retried now')
    ir.bk = now() - 180 * 1000
    t.equal(ir.retryAfter(), 0, 'long expired blocks can be retried immediately')
    ir.bk = now() - 120 * 1000
    t.equal(ir.retryAfter(), 0, 'just expired blocks can be retried immediately')
    ir.bk = now() - 60 * 1000
    t.equal(ir.retryAfter(), 60, 'unexpired blocks can be retried in a bit')
    t.end()
  }
)

test(
  'parse works',
  function (t) {
    var ir = simpleIpRecord()
    t.equal(ir.shouldBlock(), false, 'original object is not blocked')
    var irCopy1 = (ipRecord(120 * 1000, 90, 90, 2, 1, 1, now)).parse(ir)
    t.equal(irCopy1.shouldBlock(), false, 'copied object is not blocked')

    ir.block()
    t.equal(ir.shouldBlock(), true, 'original object is now blocked')
    var irCopy2 = (ipRecord(120 * 1000, 90, 90, 2, 1, 1, now)).parse(ir)
    t.equal(irCopy2.shouldBlock(), true, 'copied object is blocked')
    t.end()
  }
)

test(
  'no action update works',
  function (t) {
    var ir = simpleIpRecord()
    t.equal(ir.update(), 0, 'update with no action does nothing')
    t.end()
  }
)

test(
  'action accountStatusCheck rate-limit works',
  function (t) {
    var ir = simpleIpRecord()
    ir.as = []

    ir.update('accountStatusCheck')
    t.equal(ir.retryAfter(), 0, 'rate-limit not exceeded')
    ir.update('accountStatusCheck')
    t.equal(ir.retryAfter(), 1, 'rate-limit exceeded')
    t.end()
  }
)


test(
  'getMinLifetimeMS works',
  function (t) {
    var ir = new (ipRecord(10, 15, 20, 2, 5, now))()
    t.equal(ir.getMinLifetimeMS(), 20, 'lifetime >= rl ban duration')
    ir = new (ipRecord(11, 21, 15, 2, 5, now))()
    t.equal(ir.getMinLifetimeMS(), 21, 'lifetime >= rl tracking interval')
    ir = new (ipRecord(22, 15, 12, 2, 5, now))()
    t.equal(ir.getMinLifetimeMS(), 22, 'lifetime >= block internal')
    t.end()
  }
)

test(
  'addBadLogins works per IP',
  function (t) {
    var ir = simpleIpRecord()
    ir.addBadLogin({ errno: 999 })
    t.equal(ir.isOverBadLogins(), false, 'one record is not over')
    ir.addBadLogin({ errno: 555 })
    ir.addBadLogin({ errno: 444 })
    t.equal(ir.isOverBadLogins(), false, 'three records is not over')

    var ir2 = simpleIpRecord()
    ir2.addBadLogin({ errno: 102 })
    ir2.addBadLogin({ errno: 102 })
    t.equal(ir2.isOverBadLogins(), false, 'two unknown records is not over')
    ir2.addBadLogin({ errno: 102 })
    t.equal(ir2.isOverBadLogins(), true, 'three unknown records is over')
    t.end()
  }
)
