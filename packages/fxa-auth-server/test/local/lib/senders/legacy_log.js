/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('insist')
var sinon = require('sinon')
var legacyLog = require('../../../../lib/senders/legacy_log')

var spyLog = {
  critical: sinon.spy(),
  debug: sinon.spy(),
  error: sinon.spy(),
  info: sinon.spy(),
  warn: sinon.spy()
}

it('legacy_log unit tests', function () {
  var data = {
    op: 'testOp',
    err: 'Nooo!'
  }
  var log = legacyLog(spyLog)
  log.trace(data)
  assert.equal(spyLog.debug.args[0][0], data.op)
  assert.equal(spyLog.debug.args[0][1], data)
  log.error(data)
  assert.equal(spyLog.error.args[0][0], data.op)
  assert.equal(spyLog.error.args[0][1], data)
  log.fatal(data)
  assert.equal(spyLog.critical.args[0][0], data.op)
  assert.equal(spyLog.critical.args[0][1], data)
  log.warn(data)
  assert.equal(spyLog.warn.args[0][0], data.op)
  assert.equal(spyLog.warn.args[0][1], data)
  log.info(data)
  assert.equal(spyLog.info.args[0][0], data.op)
  assert.equal(spyLog.info.args[0][1], data)
})
