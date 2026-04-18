/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

interface NotifierInstance {
  send(event: Record<string, unknown>, cb?: () => void): void;
  __sns: { publish: jest.Mock };
}

type SnsPublishCallback = (err: null, data: Record<string, unknown>) => void;

function mockConfigWithArn(arn: string): void {
  jest.doMock('../config', () => ({
    config: {
      get: (key: string) => {
        if (key === 'snsTopicArn') {
          return arn;
        }
        return undefined;
      },
    },
  }));
}

function stubSnsPublish(notifier: NotifierInstance): void {
  notifier.__sns.publish = jest.fn(
    (event: Record<string, unknown>, cb: SnsPublishCallback) => {
      cb(null, event);
    }
  );
}

describe('notifier', () => {
  const log = {
    error: jest.fn(),
    trace: jest.fn(),
  };

  beforeEach(() => {
    log.error.mockClear();
    log.trace.mockClear();
    jest.resetModules();
  });

  describe('with sns configuration', () => {
    let notifier: NotifierInstance;

    beforeEach(() => {
      mockConfigWithArn('arn:aws:sns:us-west-2:927034868275:foo');
      const notifierModule = require('./notifier');
      notifier = notifierModule(log);
      stubSnsPublish(notifier);
    });

    it('publishes a correctly-formatted message', () => {
      notifier.send({
        event: 'stuff',
      });

      expect(log.trace.mock.calls[0][0]).toBe('Notifier.publish');
      expect(log.trace.mock.calls[0][1]).toEqual({
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
      expect(log.error).not.toHaveBeenCalled();
    });

    it('flattens additional data into the message body', () => {
      notifier.send({
        event: 'stuff-with-data',
        data: {
          cool: 'stuff',
          more: 'stuff',
        },
      });

      expect(log.trace.mock.calls[0][0]).toBe('Notifier.publish');
      expect(log.trace.mock.calls[0][1]).toEqual({
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
      expect(log.error).not.toHaveBeenCalled();
    });

    it('includes email domain in message attributes', () => {
      notifier.send({
        event: 'email-change',
        data: {
          email: 'testme@example.com',
        },
      });

      expect(log.trace.mock.calls[0][0]).toBe('Notifier.publish');
      expect(log.trace.mock.calls[0][1]).toEqual({
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
      expect(log.error).not.toHaveBeenCalled();
    });

    it('captures perf stats with statsd when it is present', () => {
      const statsd = { timing: jest.fn() };

      mockConfigWithArn('arn:aws:sns:us-west-2:927034868275:foo');
      jest.resetModules();
      const notifierModule = require('./notifier');
      notifier = notifierModule(log, statsd);
      stubSnsPublish(notifier);
      notifier.send({
        event: 'testo',
      });
      expect(statsd.timing).toHaveBeenCalledTimes(1);
      expect(statsd.timing.mock.calls[0][0]).toBe('notifier.publish');
      expect(typeof statsd.timing.mock.calls[0][1]).toBe('number');
    });
  });

  it('works with disabled configuration', () => {
    mockConfigWithArn('disabled');
    const notifierModule = require('./notifier');
    const notifier = notifierModule(log);

    notifier.send(
      {
        event: 'stuff',
      },
      () => {
        expect(log.trace.mock.calls[0][0]).toBe('Notifier.publish');
        expect(log.trace.mock.calls[0][1]).toEqual({
          data: {
            disabled: true,
          },
          success: true,
        });
        expect(log.trace.mock.calls[0][1].data.disabled).toBe(true);
        expect(log.error).not.toHaveBeenCalled();
      }
    );
  });
});
