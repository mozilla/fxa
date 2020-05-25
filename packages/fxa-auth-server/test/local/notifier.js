/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const proxyquire = require('proxyquire');
const { assert } = require('chai');
const sinon = require('sinon');

describe('notifier', () => {
  const log = {
    error: sinon.spy(),
    trace: sinon.spy(),
  };

  beforeEach(() => {
    log.error.resetHistory();
    log.trace.resetHistory();
  });

  describe('with sns configuration', () => {
    let config, notifier;

    beforeEach(() => {
      config = {
        get: (key) => {
          if (key === 'snsTopicArn') {
            return 'arn:aws:sns:us-west-2:927034868275:foo';
          }
        },
      };

      notifier = proxyquire(`${ROOT_DIR}/lib/notifier`, {
        '../config': config,
      })(log);

      notifier.__sns.publish = sinon.spy((event, cb) => {
        cb(null, event);
      });
    });

    it('publishes a correctly-formatted message', () => {
      notifier.send({
        event: 'stuff',
      });

      assert.equal(log.trace.args[0][0], 'Notifier.publish');
      assert.deepEqual(log.trace.args[0][1], {
        data: {
          TopicArn: 'arn:aws:sns:us-west-2:927034868275:foo',
          Message: '{"event":"stuff"}',
          MessageAttributes: {
            event_type: {
              DataType: 'String',
              StringValue: 'stuff',
            },
          },
        },
        success: true,
      });
      assert.equal(log.error.called, false);
    });

    it('flattens additional data into the message body', () => {
      notifier.send({
        event: 'stuff-with-data',
        data: {
          cool: 'stuff',
          more: 'stuff',
        },
      });

      assert.equal(log.trace.args[0][0], 'Notifier.publish');
      assert.deepEqual(log.trace.args[0][1], {
        data: {
          TopicArn: 'arn:aws:sns:us-west-2:927034868275:foo',
          Message: '{"cool":"stuff","more":"stuff","event":"stuff-with-data"}',
          MessageAttributes: {
            event_type: {
              DataType: 'String',
              StringValue: 'stuff-with-data',
            },
          },
        },
        success: true,
      });
      assert.equal(log.error.called, false);
    });

    it('includes email domain in message attributes', () => {
      notifier.send({
        event: 'email-change',
        data: {
          email: 'testme@example.com',
        },
      });

      assert.equal(log.trace.args[0][0], 'Notifier.publish');
      assert.deepEqual(log.trace.args[0][1], {
        data: {
          TopicArn: 'arn:aws:sns:us-west-2:927034868275:foo',
          Message: '{"email":"testme@example.com","event":"email-change"}',
          MessageAttributes: {
            email_domain: {
              DataType: 'String',
              StringValue: 'example.com',
            },
            event_type: {
              DataType: 'String',
              StringValue: 'email-change',
            },
          },
        },
        success: true,
      });
      assert.equal(log.error.called, false);
    });

    it('captures perf stats with statsd when it is present', () => {
      const statsd = { timing: sinon.stub() };
      notifier = proxyquire(`${ROOT_DIR}/lib/notifier`, {
        '../config': config,
      })(log, statsd);
      notifier.__sns.publish = sinon.spy((event, cb) => {
        cb(null, event);
      });
      notifier.send({
        event: 'testo',
      });
      assert.equal(statsd.timing.calledOnce, true, 'statsd was called');
      assert.equal(
        statsd.timing.args[0][0],
        'notifier.publish',
        'correct stat name was used'
      );
      assert.equal(
        typeof statsd.timing.args[0][1],
        'number',
        'stat value was a number'
      );
    });
  });

  it('works with disabled configuration', () => {
    const config = {
      get: (key) => {
        if (key === 'snsTopicArn') {
          return 'disabled';
        }
      },
    };
    const notifier = proxyquire(`${ROOT_DIR}/lib/notifier`, {
      '../config': config,
    })(log);

    notifier.send(
      {
        event: 'stuff',
      },
      () => {
        assert.equal(log.trace.args[0][0], 'Notifier.publish');
        assert.deepEqual(log.trace.args[0][1], {
          data: {
            disabled: true,
          },
          success: true,
        });
        assert.equal(log.trace.args[0][1].data.disabled, true);
        assert.equal(log.error.called, false);
      }
    );
  });
});
