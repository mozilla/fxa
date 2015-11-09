/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var Account = require('models/account');
  var chai = require('chai');
  var FirstRunAuthenticationBroker = require('models/auth_brokers/first-run');
  var NullChannel = require('lib/channels/null');
  var Relier = require('models/reliers/relier');
  var sinon = require('sinon');
  var WindowMock = require('../../../mocks/window');

  var assert = chai.assert;

  describe('models/auth_brokers/first-run', function () {
    var account;
    var broker;
    var iframeChannel;
    var relier;
    var windowMock;

    beforeEach(function () {
      account = new Account({});
      iframeChannel = new NullChannel();
      relier = new Relier();
      windowMock = new WindowMock();
      broker = new FirstRunAuthenticationBroker({
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
      it('notifies the iframe channel, does not halt by default', function () {
        sinon.spy(iframeChannel, 'send');

        return broker.fetch()
          .then(function () {
            return broker.afterSignIn(account);
          })
          .then(function (result) {
            assert.isTrue(iframeChannel.send.calledWith(broker._iframeCommands.LOGIN));
            assert.isUndefined(result.halt);
          });
      });

      it('halts if the `haltAfterSignIn` query parameter is set to `true`', function () {
        sinon.spy(iframeChannel, 'send');

        windowMock.location.search = '?haltAfterSignIn=true';
        broker = new FirstRunAuthenticationBroker({
          iframeChannel: iframeChannel,
          relier: relier,
          window: windowMock
        });

        return broker.fetch()
          .then(function () {
            return broker.afterSignIn(account);
          })
          .then(function (result) {
            assert.isTrue(iframeChannel.send.calledWith(broker._iframeCommands.LOGIN));
            assert.isTrue(result.halt);
          });
      });
    });

    describe('beforeSignUpConfirmationPoll', function () {
      it('notifies the iframe channel, does not halt', function () {
        sinon.spy(iframeChannel, 'send');

        return broker.beforeSignUpConfirmationPoll(account)
          .then(function (result) {
            assert.isTrue(iframeChannel.send.calledWith(broker._iframeCommands.SIGNUP_MUST_VERIFY));
            assert.isUndefined(result.halt);
          });
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


