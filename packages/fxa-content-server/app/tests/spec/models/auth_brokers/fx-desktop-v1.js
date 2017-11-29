/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const chai = require('chai');
  const FxDesktopV1AuthenticationBroker = require('models/auth_brokers/fx-desktop-v1');
  const NullChannel = require('lib/channels/null');
  const sinon = require('sinon');
  const User = require('models/user');
  const WindowMock = require('../../../mocks/window');

  var assert = chai.assert;

  describe('models/auth_brokers/fx-desktop-v1', function () {
    var account;
    var broker;
    var channelMock;
    var user;
    var windowMock;

    beforeEach(function () {
      windowMock = new WindowMock();
      channelMock = new NullChannel();
      channelMock.send = sinon.spy(function () {
        return Promise.resolve();
      });

      user = new User();
      account = user.initAccount({
        email: 'testuser@testuser.com',
        keyFetchToken: 'key-fetch-token',
        uid: 'uid',
        unwrapBKey: 'unwrap-b-key'
      });

      broker = new FxDesktopV1AuthenticationBroker({
        channel: channelMock,
        window: windowMock
      });
      sinon.stub(broker, '_hasRequiredLoginFields').callsFake(() => true);
    });

    it('has the expected capabilities', () => {
      assert.isTrue(broker.hasCapability('signup'));
      assert.isTrue(broker.hasCapability('handleSignedInNotification'));
      assert.isTrue(broker.hasCapability('emailVerificationMarketingSnippet'));
    });

    describe('createChannel', function () {
      it('creates a channel', function () {
        assert.ok(broker.createChannel());
      });
    });

    describe('channel errors', function () {
      it('are propagated outwards', function () {
        var channel = broker.createChannel();

        var errorSpy = sinon.spy();
        broker.on('error', errorSpy);

        var error = new Error('malformed message');
        channel.trigger('error', error);
        assert.isTrue(errorSpy.calledWith(error));
      });
    });

    describe('afterLoaded', function () {
      it('sends a `loaded` message', function () {
        sinon.spy(broker, 'send');

        return broker.afterLoaded()
          .then(function () {
            assert.isTrue(broker.send.calledWith('loaded'));
          });
      });
    });

    describe('afterSignIn', function () {
      it('notifies the channel of login, halts by default', function () {
        sinon.spy(broker, 'send');

        return broker.afterSignIn(account)
          .then(function (result) {
            assert.isTrue(broker.send.calledWith('login'));
            assert.isTrue(result.halt);
          });
      });
    });

    describe('afterSignInConfirmationPoll', () => {
      it('halts by default', () => {
        return broker.afterSignInConfirmationPoll(account)
        .then((result) => {
          assert.isTrue(result.halt);
        });
      });
    });

    describe('beforeSignUpConfirmationPoll', function () {
      it('notifies the channel of login', function () {
        sinon.spy(broker, 'send');

        return broker.beforeSignUpConfirmationPoll(account)
          .then((result) => {
            assert.isTrue(broker.send.calledWith('login'));
          });
      });
    });

    describe('afterSignUpConfirmationPoll', () => {
      it('halts by default', () => {
        return broker.afterSignUpConfirmationPoll(account)
        .then((result) => {
          assert.isTrue(result.halt);
        });
      });
    });

    describe('afterResetPasswordConfirmationPoll', function () {
      it('notifies the channel of login, halts by default', function () {
        sinon.spy(broker, 'send');

        // customizeSync is required to send the `login` message, but
        // it won't be set because the user hasn't visited the signup/in
        // page.
        account.unset('customizeSync');

        return broker.afterResetPasswordConfirmationPoll(account)
          .then(function (result) {
            assert.isTrue(broker.send.calledWith('login'));
            assert.isTrue(broker.send.calledOnce);
            const loginData = broker.send.args[0][1];
            assert.isFalse(loginData.customizeSync);

            assert.isTrue(result.halt);
          });
      });
    });

    describe('afterChangePassword', function () {
      it('notifies the channel of change_password with the new login info', function () {
        sinon.spy(broker, 'send');

        return broker.afterChangePassword(account)
          .then(function () {
            assert.isTrue(broker.send.calledWith('change_password'));
          });
      });
    });

    describe('afterDeleteAccount', function () {
      it('notifies the channel of delete_account', function () {
        sinon.spy(broker, 'send');

        account.set('uid', 'uid');

        return broker.afterDeleteAccount(account)
          .then(function () {
            assert.isTrue(broker.send.calledWith('delete_account'));
          });
      });
    });
  });
});

