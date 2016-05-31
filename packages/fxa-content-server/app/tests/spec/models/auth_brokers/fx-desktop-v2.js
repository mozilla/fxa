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

    beforeEach(function () {
      windowMock = new WindowMock();
      channelMock = new NullChannel();
      sinon.stub(channelMock, 'send', function () {
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

    it('has the `signup` capability', function () {
      assert.isTrue(broker.hasCapability('signup'));
    });

    it('has the `handleSignedInNotification` capability', function () {
      assert.isTrue(broker.hasCapability('handleSignedInNotification'));
    });

    it('has the `emailVerificationMarketingSnippet` capability', function () {
      assert.isTrue(broker.hasCapability('emailVerificationMarketingSnippet'));
    });

    it('does not have the `syncPreferencesNotification` capability', function () {
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

    describe('afterForceAuth', function () {
      it('notifies the channel with `fxaccounts:login`, halts', function () {
        return broker.afterForceAuth(account)
          .then(function (result) {
            assert.isTrue(channelMock.send.calledWith('fxaccounts:login'));
            assert.isTrue(result.halt);
          });
      });
    });

    describe('afterSignIn', function () {
      it('notifies the channel with `fxaccounts:login`, halts', function () {
        return broker.afterSignIn(account)
          .then(function (result) {
            assert.isTrue(channelMock.send.calledWith('fxaccounts:login'));
            assert.isTrue(result.halt);
          });
      });
    });

    describe('beforeSignUpConfirmationPoll', function () {
      it('notifies the channel with `fxaccounts:login`, halts', function () {
        return broker.beforeSignUpConfirmationPoll(account)
          .then(function (result) {
            assert.isTrue(channelMock.send.calledWith('fxaccounts:login'));
            assert.isTrue(result.halt);
          });
      });
    });

    describe('afterResetPasswordConfirmationPoll', function () {
      var result;
      beforeEach(function () {
        return broker.afterResetPasswordConfirmationPoll(account)
          .then(function (_result) {
            result = _result;
          });
      });

      it('does not notify the channel', function () {
        assert.isFalse(channelMock.send.called);
      });

      it('halts', function () {
        assert.isTrue(result.halt);
      });
    });

    describe('afterCompleteResetPassword', function () {
      var result;
      beforeEach(function () {
        return broker.afterCompleteResetPassword(account)
          .then(function (_result) {
            result = _result;
          });
      });

      it('notifies the channel with `fxaccounts:login`', function () {
        assert.isTrue(channelMock.send.calledWith('fxaccounts:login'));
      });

      it('does not halt', function () {
        assert.isFalse(!! result.halt);
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

    describe('fetch', function () {
      it('uses halt behavior with about:accounts', function () {
        sinon.stub(broker.environment, 'isAboutAccounts', function () {
          return true;
        });

        return broker.fetch()
          .then(function () {
            assert.equal(broker.getBehavior('afterForceAuth').type, 'halt');
            assert.equal(broker.getBehavior('afterResetPasswordConfirmationPoll').type, 'halt');
            assert.equal(broker.getBehavior('afterSignIn').type, 'halt');
            assert.equal(broker.getBehavior('beforeSignUpConfirmationPoll').type, 'halt');
          });
      });

      it('uses null behavior with web flow', function () {
        sinon.stub(broker.environment, 'isAboutAccounts', function () {
          return false;
        });

        return broker.fetch()
          .then(function () {
            assert.equal(broker.getBehavior('afterForceAuth').type, 'null');
            assert.equal(broker.getBehavior('afterResetPasswordConfirmationPoll').type, 'null');
            assert.equal(broker.getBehavior('afterSignIn').type, 'null');
            assert.equal(broker.getBehavior('beforeSignUpConfirmationPoll').type, 'null');
          });
      });
    });
  });
});
