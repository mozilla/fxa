/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'lib/channels/null',
  'models/auth_brokers/fx-fennec-v1',
  'models/reliers/relier',
  'models/user',
  'sinon',
  '../../../mocks/window'
],
function (chai, NullChannel, FxFennecV1AuthenticationBroker, Relier,
  User, sinon, WindowMock) {
  'use strict';

  var assert = chai.assert;

  describe('models/auth_brokers/fx-fennec-v1', function () {
    var account;
    var broker;
    var channel;
    var relier;
    var user;
    var windowMock;

    beforeEach(function () {
      channel = new NullChannel();
      relier = new Relier();
      windowMock = new WindowMock();

      user = new User();
      account = user.initAccount({
        email: 'testuser@testuser.com'
      });

      broker = new FxFennecV1AuthenticationBroker({
        channel: channel,
        relier: relier,
        window: windowMock
      });

      sinon.spy(broker, 'send');
    });

    describe('afterResetPasswordConfirmationPoll', function () {
      it('notifies the channel of login, does not halt', function () {
        return broker.afterResetPasswordConfirmationPoll(account)
          .then(function (result) {
            assert.isTrue(broker.send.calledWith('fxaccounts:login'));
            assert.isUndefined(result.halt);
          });
      });
    });

    describe('afterSignIn', function () {
      it('notifies the channel of login, does not halt', function () {
        return broker.afterSignIn(account)
          .then(function (result) {
            assert.isTrue(broker.send.calledWith('fxaccounts:login'));
            assert.isUndefined(result.halt);
          });
      });
    });

    describe('beforeSignUpConfirmationPoll', function () {
      it('notifies the channel of login, does not halt', function () {
        return broker.beforeSignUpConfirmationPoll(account)
          .then(function (result) {
            assert.isTrue(broker.send.calledWith('fxaccounts:login'));
            assert.isUndefined(result.halt);
          });
      });
    });
  });
});


