/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import sinon from 'sinon';
import WebChannelReceiver from 'lib/channels/receivers/web-channel';
import WindowMock from '../../../../mocks/window';

var windowMock;
var receiver;
var Sentry;

describe('lib/channels/receivers/web-channel', () => {
  beforeEach(() => {
    windowMock = new WindowMock();
    Sentry = {
      captureMessage: () => {},
    };
    receiver = new WebChannelReceiver();
    receiver.initialize({
      webChannelId: 'channel_id',
      window: windowMock,
      Sentry,
    });
    sinon.spy(receiver._sentry, 'captureMessage');
  });

  afterEach(() => {
    receiver.teardown();
  });

  describe('receiveMessage', () => {
    it('prints an error to the console if the message is malformed', () => {
      sinon.spy(windowMock.console, 'error');

      // missing detail
      receiver.receiveMessage({});
      assert.equal(windowMock.console.error.callCount, 1);

      // missing id
      receiver.receiveMessage({
        detail: {
          message: {},
        },
      });
      assert.equal(windowMock.console.error.callCount, 2);

      windowMock.console.error.restore();
    });

    it('ignores messages without a `message`', () => {
      sinon.spy(receiver, 'trigger');

      receiver.receiveMessage({
        detail: {
          id: 'channel_id',
        },
      });

      assert.isFalse(receiver.trigger.called);
    });

    it('ignores messages from other channels', () => {
      sinon.spy(receiver, 'trigger');

      receiver.receiveMessage({
        detail: {
          id: 'another_channel',
          message: {
            key: 'value',
          },
        },
      });

      assert.isFalse(receiver.trigger.called);
    });

    it("triggers a `message` event with event's message", () => {
      sinon.spy(receiver, 'trigger');

      receiver.receiveMessage({
        detail: {
          id: 'channel_id',
          message: {
            key: 'value',
          },
        },
      });

      assert.isTrue(receiver.trigger.calledWith('message', { key: 'value' }));
    });

    it('can handle errors triggered by the WebChannel component', () => {
      sinon.spy(windowMock.console, 'error');
      sinon.spy(receiver, 'trigger');
      sinon.spy(receiver, '_reportError');

      const message = {
        error: 'Permission denied',
      };
      receiver.receiveMessage({
        detail: {
          id: 'channel_id',
          message,
        },
      });

      assert.equal(windowMock.console.error.callCount, 1);
      assert.isTrue(
        windowMock.console.error.calledWith(
          'WebChannel error:',
          'Permission denied'
        )
      );
      assert.isTrue(receiver._reportError.calledOnce);
      assert.isTrue(receiver._sentry.captureMessage.calledOnce);
      assert.isTrue(receiver.trigger.calledOnce);
      assert.isTrue(receiver.trigger.calledWith('error', message));
    });

    it('does not report "No Such Channel" errors to Sentry', () => {
      sinon.spy(windowMock.console, 'error');
      sinon.spy(receiver, 'trigger');
      sinon.spy(receiver, '_reportError');

      const message = {
        error: 'No Such Channel',
      };
      receiver.receiveMessage({
        detail: {
          id: 'channel_id',
          message,
        },
      });

      assert.equal(windowMock.console.error.callCount, 1);
      assert.isTrue(
        windowMock.console.error.calledWith(
          'WebChannel error:',
          'No Such Channel'
        )
      );
      assert.isTrue(receiver._reportError.calledOnce);
      assert.isFalse(receiver._sentry.captureMessage.calledOnce);
      assert.isTrue(receiver.trigger.calledOnce);
      assert.isTrue(receiver.trigger.calledWith('error', message));
    });

    it('can handle errors that have a stack in data', () => {
      sinon.spy(windowMock.console, 'error');
      sinon.spy(receiver, 'trigger');
      sinon.spy(receiver, '_reportError');

      const message = {
        data: {
          error: {
            message: 'Permission denied',
            stack: 'foo \n bar',
          },
        },
      };
      receiver.receiveMessage({
        detail: {
          id: 'channel_id',
          message,
        },
      });

      assert.equal(windowMock.console.error.callCount, 1);
      assert.isTrue(
        windowMock.console.error.calledWith(
          'WebChannel error:',
          'Permission denied'
        )
      );
      assert.isTrue(receiver._reportError.calledOnce);
      assert.isTrue(receiver.trigger.calledOnce);
      assert.isTrue(receiver.trigger.calledWith('error', message));
    });
  });

  describe('_extractErrorFromMessage', () => {
    it('extracts any errors from the WebChannel message', () => {
      assert.isUndefined(
        receiver._extractErrorFromMessage({ data: 'ok' }),
        'undefined if no error'
      );
      assert.deepEqual(
        receiver._extractErrorFromMessage({ error: 'fail' }),
        { message: 'fail', stack: null },
        'object if error'
      );
      assert.isUndefined(
        receiver._extractErrorFromMessage({
          error: { shouldNotBeObject: true },
        }),
        'undefined if direct object'
      );
      assert.deepEqual(
        receiver._extractErrorFromMessage({
          data: { error: { message: 'error' } },
        }),
        { message: 'error', stack: undefined },
        'object if nested error object'
      );
    });
  });

  describe('_reportError', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.spy(receiver._logger, 'error');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('notifies the logger', () => {
      receiver._reportError({
        message: 'the error message',
        stack: 'stack object',
      });

      assert.isTrue(receiver._logger.error.calledOnce);
    });
  });
});
