/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import AuthErrors from 'lib/auth-errors';
import DuplexChannel from 'lib/channels/duplex';
import sinon from 'sinon';
import WebChannel from 'lib/channels/web';
import WindowMock from '../../../mocks/window';

describe('lib/channels/web', () => {
  let channel;
  let windowMock;

  beforeEach(() => {
    windowMock = new WindowMock();
    windowMock.navigator.userAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:49.0) Gecko/20100101 Firefox/49.0';
  });

  afterEach(() => {
    if (channel) {
      channel.teardown();
      channel = null;
    }
  });

  it('requires an id', () => {
    assert.throws(() => {
      new WebChannel(); //eslint-disable-line no-new
    }, 'WebChannel must have an id');
  });

  it('exports the expected commands on the static interface', () => {
    assert.ok(WebChannel.CAN_LINK_ACCOUNT);
    assert.ok(WebChannel.CHANGE_PASSWORD);
    assert.ok(WebChannel.DELETE);
    assert.ok(WebChannel.DELETE_ACCOUNT);
    assert.ok(WebChannel.FXA_STATUS);
    assert.ok(WebChannel.LOADED);
    assert.ok(WebChannel.LOGIN);
    assert.ok(WebChannel.LOGOUT);
    assert.ok(WebChannel.OAUTH_LOGIN);
    assert.ok(WebChannel.PAIR_AUTHORIZE);
    assert.ok(WebChannel.PAIR_DECLINE);
    assert.ok(WebChannel.PAIR_REQUEST_SUPPLICANT_METADATA);
    assert.ok(WebChannel.PROFILE_CHANGE);
    assert.ok(WebChannel.VERIFIED);
  });

  it('exports the expected commands on an instance', () => {
    channel = new WebChannel('MyChannel');
    channel.initialize({
      window: windowMock,
    });

    assert.lengthOf(Object.keys(channel.COMMANDS), 17);
    assert.ok(channel.COMMANDS.CAN_LINK_ACCOUNT);
    assert.ok(channel.COMMANDS.CHANGE_PASSWORD);
    assert.ok(channel.COMMANDS.DELETE);
    assert.ok(channel.COMMANDS.DELETE_ACCOUNT);
    assert.ok(channel.COMMANDS.FXA_STATUS);
    assert.ok(channel.COMMANDS.LOADED);
    assert.ok(channel.COMMANDS.LOGIN);
    assert.ok(channel.COMMANDS.LOGOUT);
    assert.ok(channel.COMMANDS.OAUTH_LOGIN);
    assert.ok(channel.COMMANDS.PAIR_AUTHORIZE);
    assert.ok(channel.COMMANDS.PAIR_DECLINE);
    assert.ok(channel.COMMANDS.PAIR_COMPLETE);
    assert.ok(channel.COMMANDS.PAIR_HEARTBEAT);
    assert.ok(channel.COMMANDS.PAIR_PREFERENCES);
    assert.ok(channel.COMMANDS.PAIR_REQUEST_SUPPLICANT_METADATA);
    assert.ok(channel.COMMANDS.PROFILE_CHANGE);
    assert.ok(channel.COMMANDS.VERIFIED);
  });

  describe('send', () => {
    it('sends a message', () => {
      channel = new WebChannel('MyChannel');
      channel.initialize({
        window: windowMock,
      });

      return channel.send('after_render', {}).then(() => {
        assert.ok(windowMock.dispatchedEvents['after_render']);
      });
    });

    it('throws an error if dispatchEvent fails', () => {
      sinon.stub(windowMock, 'dispatchEvent').callsFake(() => {
        throw new Error('Not supported');
      });

      channel = new WebChannel('MyChannel');
      channel.initialize({
        window: windowMock,
      });

      channel.send('after_render', {}).then(assert.fail, function(err) {
        assert.equal(err.message, 'Not supported');
      });
    });
  });

  describe('request', () => {
    it('sends a message, waits for a response, ', () => {
      channel = new WebChannel('MyChannel');
      channel.initialize({
        window: windowMock,
      });
      sinon.stub(windowMock, 'dispatchEvent').callsFake(function(dispatched) {
        channel._receiver.trigger('message', {
          command: 'can_link_account',
          data: { ok: true },
          messageId: dispatched.detail.message.messageId,
        });
      });

      return channel
        .request('can_link_account', { email: 'testuser@testuser.com' })
        .then(function(response) {
          assert.isTrue(response.ok);
        });
    });
  });

  describe('isFxaStatusSupported', () => {
    it('returns `true` if Fx Desktop >= 55', () => {
      channel = new WebChannel('MyChannel');
      channel.initialize({
        window: windowMock,
      });

      // Desktop
      assert.isFalse(
        channel.isFxaStatusSupported(
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:54.0) Gecko/20100101 Firefox/54.0'
        )
      );
      assert.isTrue(
        channel.isFxaStatusSupported(
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/55.0'
        )
      );
      assert.isTrue(
        channel.isFxaStatusSupported(
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:56.0) Gecko/20100101 Firefox/56.0'
        )
      );

      // Android
      assert.isFalse(
        channel.isFxaStatusSupported(
          'Mozilla/5.0 (Android 4.4; Mobile; rv:55.0) Gecko/55.0 Firefox/55.0'
        )
      );

      // iOS
      assert.isFalse(
        channel.isFxaStatusSupported(
          'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/600.1.4'
        )
      );
    });
  });

  describe('onErrorReceived', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();

      channel = new WebChannel('MyChannel');
      channel.initialize({
        window: windowMock,
      });

      sandbox.stub(channel, 'rejectAllOutstandingRequests').callsFake(() => {});
      sandbox
        .stub(DuplexChannel.prototype, 'onErrorReceived')
        .callsFake(() => {});
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('with a `No Such Channel` error', () => {
      it('rejects outstanding requests, delegates to the parent method', () => {
        const webChannelError = {
          error: new Error('No Such Channel'),
        };
        channel.onErrorReceived(webChannelError);

        assert.isTrue(channel.rejectAllOutstandingRequests.calledOnce);
        const receivedError = channel.rejectAllOutstandingRequests.args[0][0];
        assert.isTrue(AuthErrors.is(receivedError, 'INVALID_WEB_CHANNEL'));

        assert.isTrue(DuplexChannel.prototype.onErrorReceived.calledOnce);
        assert.isTrue(
          DuplexChannel.prototype.onErrorReceived.calledWith(webChannelError)
        );
      });
    });

    describe('OAuth WebChannel', () => {
      it('does not reject outstanding requests for the OAuth WebChannel', () => {
        channel = new WebChannel('MyChannel');
        channel.initialize({
          window: windowMock,
          isOAuthWebChannel: true,
        });
        sandbox
          .stub(channel, 'rejectAllOutstandingRequests')
          .callsFake(() => {});

        const webChannelError = {
          error: new Error('No Such Channel'),
        };
        channel.onErrorReceived(webChannelError);
        assert.isFalse(channel.rejectAllOutstandingRequests.called);
      });
    });

    describe('with another WebChannel error', () => {
      it('delegates ot the parent method', () => {
        const webChannelError = {
          error: new Error('Error sending request'),
        };
        channel.onErrorReceived(webChannelError);
        assert.isFalse(channel.rejectAllOutstandingRequests.called);

        assert.isTrue(DuplexChannel.prototype.onErrorReceived.calledOnce);
        assert.isTrue(
          DuplexChannel.prototype.onErrorReceived.calledWith(webChannelError)
        );
      });
    });
  });
});
