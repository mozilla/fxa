/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

require('ass')
var test = require('tap').test
var ipRecord = require('../../ip_record')

function now() {
  return 240*1000 // old school
}

function simpleIpRecord() {
  return new (ipRecord(120*1000, now))()
}

test(
  'isBlocked works',
  function (t) {
    var ir = simpleIpRecord()

    t.equal(ir.isBlocked(), false, 'record has never been blocked')
    ir.bk = now()
    t.equal(ir.isBlocked(), true, 'record is blocked')
    ir.bk = now() - 60*1000;
    t.equal(ir.isBlocked(), true, 'record is still blocked')
    ir.bk = now() - 120*1000; // blockInterval
    t.equal(ir.isBlocked(), false, 'record is no longer blocked')
    t.end()
  }
)

test(
  'block works',
  function (t) {
    var ir = simpleIpRecord()

    t.equal(ir.isBlocked(), false, 'record has never been blocked')
    ir.block()
    t.equal(ir.isBlocked(), true, 'record is blocked')
    t.end()
  }
)

test(
  'retryAfter works',
  function (t) {
    var ir = simpleIpRecord()

    t.equal(ir.retryAfter(), 0, 'unblocked records can be retried now')
    ir.bk = now() - 180*1000
    t.equal(ir.retryAfter(), 0, 'long expired blocks can be retried immediately')
    ir.bk = now() - 120*1000
    t.equal(ir.retryAfter(), 0, 'just expired blocks can be retried immediately')
    ir.bk = now() - 60*1000
    t.equal(ir.retryAfter(), 60, 'unexpired blocks can be retried in a bit')
    t.end()
  }
)

test(
  'parse works',
  function (t) {
    var ir = simpleIpRecord()
    t.equal(ir.isBlocked(), false, 'original object is not blocked')
    var irCopy1 = (ipRecord(120*1000, now)).parse(ir)
    t.equal(irCopy1.isBlocked(), false, 'copied object is not blocked')

    ir.block()
    t.equal(ir.isBlocked(), true, 'original object is now blocked')
    var irCopy2 = (ipRecord(120*1000, now)).parse(ir)
    t.equal(irCopy2.isBlocked(), true, 'copied object is blocked')
    t.end()
  }
)

test(
  'update works',
  function (t) {
    var ir = simpleIpRecord()
    t.equal(ir.update(), 0, 'update does nothing')
    t.end()
  }
)
