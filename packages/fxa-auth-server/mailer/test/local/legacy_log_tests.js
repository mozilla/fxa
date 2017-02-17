/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var sinon = require('sinon')
var tap = require('tap')
var test = tap.test
var legacyLog = require('../../legacy_log')

var spyLog = {
  critical: sinon.spy(),
  debug: sinon.spy(),
  error: sinon.spy(),
  info: sinon.spy(),
  warn: sinon.spy()
}

test('legacy_log unit tests', function (t) {
  var data = {
    op: 'testOp',
    err: 'Nooo!'
  }
  var log = legacyLog(spyLog)
  log.trace(data)
  t.equal(spyLog.debug.args[0][0], data.op)
  t.equal(spyLog.debug.args[0][1], data)
  log.error(data)
  t.equal(spyLog.error.args[0][0], data.op)
  t.equal(spyLog.error.args[0][1], data)
  log.fatal(data)
  t.equal(spyLog.critical.args[0][0], data.op)
  t.equal(spyLog.critical.args[0][1], data)
  log.warn(data)
  t.equal(spyLog.warn.args[0][0], data.op)
  t.equal(spyLog.warn.args[0][1], data)
  log.info(data)
  t.equal(spyLog.info.args[0][0], data.op)
  t.equal(spyLog.info.args[0][1], data)
  t.done()
})
