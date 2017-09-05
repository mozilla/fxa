/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const chai = require('chai');
  const FxDesktopV3AuthenticationBroker = require('models/auth_brokers/fx-desktop-v3');
  const sinon = require('sinon');
  const WindowMock = require('../../../mocks/window');

  var assert = chai.assert;

  describe('models/auth_brokers/fx-desktop-v3', function () {
    var broker;
    var windowMock;

    beforeEach(function () {
      windowMock = new WindowMock();

      broker = new FxDesktopV3AuthenticationBroker({
        window: windowMock
      });
    });

    describe('capabilities', function () {
      it('has the `allowUidChange` capability', function () {
        assert.isTrue(broker.hasCapability('allowUidChange'));
      });
    });

    describe('fetch', function () {
      it('uses halt behavior with about:accounts', function () {
        sinon.stub(broker.environment, 'isAboutAccounts').callsFake(function () {
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
        sinon.stub(broker.environment, 'isAboutAccounts').callsFake(function () {
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
