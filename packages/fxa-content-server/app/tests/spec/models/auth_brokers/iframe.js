/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';


define([
  'chai',
  'sinon',
  'jquery',
  'models/auth_brokers/iframe',
  'models/reliers/relier',
  'lib/promise',
  'lib/channels/null',
  'lib/session',
  'lib/auth-errors',
  '../../../mocks/window'
],
function (chai, sinon, $, IframeAuthenticationBroker, Relier, p, NullChannel,
      Session, AuthErrors, WindowMock) {
  var assert = chai.assert;

  describe('models/auth_brokers/iframe', function () {
    var broker;
    var windowMock;
    var relierMock;
    var channelMock;

    beforeEach(function () {
      windowMock = new WindowMock();
      relierMock = new Relier();

      channelMock = new NullChannel();
      sinon.spy(channelMock, 'send');

      broker = new IframeAuthenticationBroker({
        window: windowMock,
        relier: relierMock,
        channel: channelMock,
        session: Session
      });
    });

    afterEach(function () {
      if ($.getJSON.restore) {
        $.getJSON.restore();
      }
    });

    describe('sendOAuthResultToRelier', function () {
      it('sends an `oauth_complete` message', function () {
        sinon.stub(broker, 'send', function () {
          return p();
        });

        return broker.sendOAuthResultToRelier({ email: 'testuser@testuesr.com' })
          .then(function () {
            assert.isTrue(broker.send.calledWith('oauth_complete'));
          });
      });
    });

    describe('getChannel', function () {
      it('gets an IframeChannel', function () {
        var channel = broker.getChannel();
        assert.ok(channel);
      });
    });

    describe('canCancel', function () {
      it('returns true', function () {
        assert.isTrue(broker.canCancel());
      });
    });

    describe('cancel', function () {
      it('sends the `oauth_cancel` message over the channel', function () {
        return broker.cancel()
          .then(function () {
            assert.isTrue(channelMock.send.calledWith('oauth_cancel'));
          });
      });
    });

    describe('afterLoaded', function () {
      it('sends a `loaded` message', function () {
        return broker.afterLoaded()
          .then(function () {
            assert.isTrue(channelMock.send.calledWith('loaded'));
          });
      });
    });

  });
});


