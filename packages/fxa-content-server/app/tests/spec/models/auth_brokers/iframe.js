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

    describe('selectStartPage', function () {
      it('returns nothing if RP is allowed to use the IFRAME', function () {
        sinon.stub(broker, 'send', function () {
          return p({
            origin: 'https://marketplace.firefox.com'
          });
        });

        relierMock.set('redirectUri', 'https://marketplace.firefox.com/endpoint');

        return broker.selectStartPage()
          .then(function (page) {
            assert.isUndefined(page);
          });
      });

      it('returns `illegal_iframe` if RP is not allowed to use the IFRAME', function () {
        sinon.stub(broker, 'send', function () {
          return p({
            origin: 'https://conartist.com'
          });
        });

        relierMock.set('redirectUri', 'https://marketplace.firefox.com/endpoint');

        return broker.selectStartPage()
          .then(function (page) {
            assert.equal(page, 'illegal_iframe');
          });
      });

      it('re-throws other errors', function () {
        sinon.stub(broker, 'send', function () {
          return p.reject(new Error('uh oh'));
        });

        relierMock.set('redirectUri', 'https://marketplace.firefox.com/endpoint');

        return broker.selectStartPage()
          .then(assert.fail, function (err) {
            assert.equal(err.message, 'uh oh');
          });
      });
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
      it('creates an IframeChannel', function () {
        var broker = new IframeAuthenticationBroker({
          windowMock: windowMock,
          relier: relierMock
        });

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


