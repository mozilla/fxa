/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const ROOT_DIR = '../..'

const proxyquire = require('proxyquire')
const assert = require('insist')
const sinon = require('sinon')

describe('notifier', () => {
  const log = {
    error: sinon.spy(),
    trace: sinon.spy()
  }

  beforeEach(() => {
    log.error.reset()
    log.trace.reset()
  })

  it('works with sns configuration', () => {
    const config = {
      get: (key) => {
        if (key === 'snsTopicArn') {
          return 'arn:aws:sns:us-west-2:927034868275:foo'
        }
      }
    }

    const notifier = proxyquire(`${ROOT_DIR}/lib/notifier`, {
      '../config': config
    })(log)

    notifier.__sns.publish = sinon.spy((event, cb) => {
      cb(null, event)
    })

    notifier.send({
      event: {
        stuff: true
      }
    })

    assert.deepEqual(log.trace.args[0][0], {
      op: 'Notifier.publish',
      data: {
        TopicArn: 'arn:aws:sns:us-west-2:927034868275:foo',
        Message: '{\"event\":{\"stuff\":true}}'
      },
      success: true
    })
    assert.equal(log.error.called, false)
  })

  it('works with disabled configuration', () => {
    const config = {
      get: (key) => {
        if (key === 'snsTopicArn') {
          return 'disabled'
        }
      }
    }
    const notifier = proxyquire(`${ROOT_DIR}/lib/notifier`, {
      '../config': config
    })(log)

    notifier.send({
      stuff: true
    }, () => {
      assert.deepEqual(log.trace.args[0][0], {
        op: 'Notifier.publish',
        data: {
          disabled: true
        },
        success: true
      })
      assert.equal(log.trace.args[0][0].data.disabled, true)
      assert.equal(log.error.called, false)
    })

  })

})
