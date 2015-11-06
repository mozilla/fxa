/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var FxDesktopV2AuthenticationBroker = require('models/auth_brokers/fx-desktop-v2');
  var NullChannel = require('lib/channels/null');
  var p = require('lib/promise');
  var sinon = require('sinon');
  var User = require('models/user');
  var WindowMock = require('../../../mocks/window');

  var assert = chai.assert;

  describe('models/auth_brokers/fx-desktop-v2', function () {
    var account;
    var broker;
    var channelMock;
    var user;
    var windowMock;

    before(function () {
      windowMock = new WindowMock();
      channelMock = new NullChannel();
      channelMock.send = sinon.spy(function () {
        return p();
      });

      user = new User();
      account = user.initAccount({
        email: 'testuser@testuser.com',
        keyFetchToken: 'key-fetch-token',
        unwrapBKey: 'unwrap-b-key'
      });

      broker = new FxDesktopV2AuthenticationBroker({
        channel: channelMock,
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

    describe('createChannel', function () {
      it('creates a channel', function () {
        assert.ok(broker.createChannel());
      });
    });

    describe('afterLoaded', function () {
      it('sends a `fxaccounts:loaded` message', function () {
        return broker.afterLoaded()
          .then(function () {
            assert.isTrue(channelMock.send.calledWith('fxaccounts:loaded'));
          });
      });
    });

    describe('afterSignIn', function () {
      it('notifies the channel with `fxaccounts:login`, does not halt', function () {
        return broker.afterSignIn(account)
          .then(function (result) {
            assert.isTrue(channelMock.send.calledWith('fxaccounts:login'));
            assert.isUndefined(result.halt);
          });
      });
    });

    describe('beforeSignUpConfirmationPoll', function () {
      it('notifies the channel with `fxaccounts:login`, does not halt', function () {
        return broker.beforeSignUpConfirmationPoll(account)
          .then(function (result) {
            assert.isTrue(channelMock.send.calledWith('fxaccounts:login'));
            assert.isUndefined(result.halt);
          });
      });
    });

    describe('afterResetPasswordConfirmationPoll', function () {
      it('notifies the channel with `fxaccounts:login`, halts by default', function () {
        return broker.afterResetPasswordConfirmationPoll(account)
          .then(function (result) {
            assert.isTrue(channelMock.send.calledWith('fxaccounts:login'));
            assert.isUndefined(result.halt);
          });
      });
    });

    describe('afterChangePassword', function () {
      it('notifies the channel with `fxaccounts:change_password`', function () {
        return broker.afterChangePassword(account)
          .then(function () {
            assert.isTrue(channelMock.send.calledWith('fxaccounts:change_password'));
          });
      });
    });

    describe('afterDeleteAccount', function () {
      it('notifies the channel with `fxaccounts:delete_account`', function () {
        account.set('uid', 'uid');

        return broker.afterDeleteAccount(account)
          .then(function () {
            assert.isTrue(channelMock.send.calledWith('fxaccounts:delete_account'));
          });
      });
    });

    it('disables the `chooseWhatToSyncCheckbox` capability', function () {
      return broker.fetch()
        .then(function () {
          assert.isFalse(broker.hasCapability('chooseWhatToSyncCheckbox'));
        });
    });

    describe('afterSignUp', function () {
      afterEach(function () {
        broker.hasCapability.restore();
      });

      it('causes a redirect to `/choose_what_to_sync` if `chooseWhatToSyncWebV1` capability is supported', function () {
        sinon.stub(broker, 'hasCapability', function (capabilityName) {
          return capabilityName === 'chooseWhatToSyncWebV1';
        });

        return broker.afterSignUp(account)
          .then(function (behavior) {
            assert.equal(behavior.endpoint, 'choose_what_to_sync');
          });
      });

      it('does nothing if `chooseWhatToSyncWebV1` capability is unsupported', function () {
        sinon.stub(broker, 'hasCapability', function () {
          return false;
        });

        return broker.afterSignUp(account)
          .then(function (behavior) {
            assert.isUndefined(behavior);
          });
      });
    });
  });
});
