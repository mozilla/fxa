/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var $ = require('jquery');
  var chai = require('chai');
  var IframeAuthenticationBroker = require('models/auth_brokers/iframe');
  var NullChannel = require('lib/channels/null');
  var p = require('lib/promise');
  var Relier = require('models/reliers/relier');
  var Session = require('lib/session');
  var sinon = require('sinon');
  var WindowMock = require('../../../mocks/window');

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
        channel: channelMock,
        relier: relierMock,
        session: Session,
        window: windowMock
      });
    });

    afterEach(function () {
      if ($.getJSON.restore) {
        $.getJSON.restore();
      }
    });

    it('has the `signup` capability by default', function () {
      assert.isTrue(broker.hasCapability('signup'));
    });

    it('does not have the `handleSignedInNotification` capability by default', function () {
      assert.isFalse(broker.hasCapability('handleSignedInNotification'));
    });

    it('has the `emailVerificationMarketingSnippet` capability by default', function () {
      assert.isTrue(broker.hasCapability('emailVerificationMarketingSnippet'));
    });

    it('does not have the `syncPreferencesNotification` capability by default', function () {
      assert.isFalse(broker.hasCapability('syncPreferencesNotification'));
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


