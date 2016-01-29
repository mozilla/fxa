/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var Account = require('models/account');
  var chai = require('chai');
  var FxFirstrunV1AuthenticationBroker = require('models/auth_brokers/fx-firstrun-v1');
  var NullChannel = require('lib/channels/null');
  var p = require('lib/promise');
  var Relier = require('models/reliers/relier');
  var sinon = require('sinon');
  var WindowMock = require('../../../mocks/window');

  var assert = chai.assert;

  describe('models/auth_brokers/fx-firstrun-v1', function () {
    var account;
    var broker;
    var channelMock;
    var iframeChannel;
    var relier;
    var windowMock;

    beforeEach(function () {
      account = new Account({
        email: 'testuser@testuser.com',
        keyFetchToken: 'key-fetch-token',
        unwrapBKey: 'unwrap-b-key'
      });
      channelMock = new NullChannel();
      channelMock.send = sinon.spy(function () {
        return p();
      });
      iframeChannel = new NullChannel();
      relier = new Relier();
      windowMock = new WindowMock();

      broker = new FxFirstrunV1AuthenticationBroker({
        channel: channelMock,
        iframeChannel: iframeChannel,
        relier: relier,
        window: windowMock
      });
    });

    it('has the `signup` capability by default', function () {
      assert.isTrue(broker.hasCapability('signup'));
    });

    it('has the `handleSignedInNotification` capability by default', function () {
      assert.isTrue(broker.hasCapability('handleSignedInNotification'));
    });

    it('has the `emailVerificationMarketingSnippet` capability by default', function () {
      assert.isTrue(broker.hasCapability('emailVerificationMarketingSnippet'));
    });

    it('does not have the `syncPreferencesNotification` capability by default', function () {
      assert.isFalse(broker.hasCapability('syncPreferencesNotification'));
    });

    describe('afterLoaded', function () {
      it('notifies the iframe channel', function () {
        sinon.spy(iframeChannel, 'send');

        return broker.afterLoaded(account)
          .then(function () {
            assert.isTrue(iframeChannel.send.calledWith(broker._iframeCommands.LOADED));
          });
      });
    });

    describe('afterSignIn', function () {
      var result;

      describe('defaults', function () {
        beforeEach(function () {
          sinon.spy(iframeChannel, 'send');

          return broker.fetch()
            .then(function () {
              return broker.afterSignIn(account);
            })
            .then(function (_result) {
              result = _result;
            });
        });

        it('notifies the web channel', function () {
          assert.isTrue(channelMock.send.calledWith('fxaccounts:login'));
        });

        it('notifies the iframe channel', function () {
          assert.isTrue(iframeChannel.send.calledWith(broker._iframeCommands.LOGIN));
        });

        it('does not halt by default', function () {
          assert.isUndefined(result.halt);
        });
      });

      describe('with the `haltAfterSignIn` query parameter set to `true`', function () {
        beforeEach(function () {
          windowMock.location.search = '?haltAfterSignIn=true';
          broker = new FxFirstrunV1AuthenticationBroker({
            iframeChannel: iframeChannel,
            relier: relier,
            window: windowMock
          });

          return broker.fetch()
            .then(function () {
              return broker.afterSignIn(account);
            })
            .then(function (_result) {
              result = _result;
            });
        });

        it('halts', function () {
          assert.isTrue(result.halt);
        });
      });
    });

    describe('beforeSignUpConfirmationPoll', function () {
      var result;
      beforeEach(function () {
        sinon.spy(iframeChannel, 'send');

        account.set('needsOptedInToMarketingEmail', true);

        return broker.beforeSignUpConfirmationPoll(account)
          .then(function (_result) {
            result = _result;
          });
      });

      it('notifies the iframe channel', function () {
        assert.isTrue(
          iframeChannel.send.calledWith(
            broker._iframeCommands.SIGNUP_MUST_VERIFY, { emailOptIn: true }));
      });

      it('does not halt', function () {
        assert.isUndefined(result.halt);
      });
    });

    describe('afterSignUpConfirmationPoll', function () {
      it('notifies the iframe channel', function () {
        sinon.spy(iframeChannel, 'send');

        return broker.afterSignUpConfirmationPoll(account)
          .then(function () {
            assert.isTrue(iframeChannel.send.calledWith(broker._iframeCommands.VERIFICATION_COMPLETE));
          });
      });
    });

    describe('afterResetPasswordConfirmationPoll', function () {
      it('notifies the iframe channel, does not halt', function () {
        sinon.spy(iframeChannel, 'send');

        return broker.afterResetPasswordConfirmationPoll(account)
          .then(function (result) {
            assert.isTrue(iframeChannel.send.calledWith(broker._iframeCommands.VERIFICATION_COMPLETE));
            assert.isUndefined(result.halt);
          });
      });
    });
  });
});


