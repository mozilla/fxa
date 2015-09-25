/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'lib/channels/null',
  'lib/promise',
  '../../../mocks/window',
  'models/auth_brokers/fx-desktop-v2',
  'models/user',
  'sinon'
], function (chai, NullChannel, p, WindowMock, FxDesktopV2AuthenticationBroker,
  User, sinon) {
  'use strict';

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
      channelMock.send = sinon.spy(function () {
        return p();
      });

      user = new User();
      account = user.initAccount({
        email: 'testuser@testuser.com'
      });

      broker = new FxDesktopV2AuthenticationBroker({
        channel: channelMock,
        window: windowMock
      });
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

  });
});
