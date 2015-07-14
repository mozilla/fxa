/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'models/account',
  'models/auth_brokers/first-run',
  'models/reliers/relier',
  '../../../mocks/window'
],
function (chai, Account, FirstRunAuthenticationBroker, Relier, WindowMock) {
  'use strict';

  var assert = chai.assert;

  describe('models/auth_brokers/first-run', function () {
    var account;
    var broker;
    var relier;
    var windowMock;

    beforeEach(function () {
      account = new Account({});
      relier = new Relier();
      windowMock = new WindowMock();
      broker = new FirstRunAuthenticationBroker({
        relier: relier,
        window: windowMock
      });
    });

    describe('afterSignIn', function () {
      it('does not halt', function () {
        return broker.afterSignIn(account)
          .then(function (result) {
            assert.isFalse(result.halt);
          });
      });
    });

    describe('beforeSignUpConfirmationPoll', function () {
      it('does not halt', function () {
        return broker.beforeSignUpConfirmationPoll(account)
          .then(function (result) {
            assert.isFalse(result.halt);
          });
      });
    });

    describe('afterResetPasswordConfirmationPoll', function () {
      it('does not halt', function () {
        return broker.afterResetPasswordConfirmationPoll(account)
          .then(function (result) {
            assert.isFalse(result.halt);
          });
      });
    });
  });
});


