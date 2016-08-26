/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var FxiOSAuthenticationBroker = require('models/auth_brokers/fx-ios-v1');
  var NullChannel = require('lib/channels/null');
  var Relier = require('models/reliers/relier');
  var WindowMock = require('../../../mocks/window');

  var assert = chai.assert;

  describe('models/auth_brokers/fx-ios-v1', function () {
    var channel;
    var loginMessageDelayMS = 250;
    var relier;
    var windowMock;

    function createBroker () {
      return new FxiOSAuthenticationBroker({
        channel: channel,
        loginMessageDelayMS: loginMessageDelayMS,
        relier: relier,
        window: windowMock
      });
    }

    before(function () {
      channel = new NullChannel();
      relier = new Relier();
      windowMock = new WindowMock();
    });

    describe('broker tests', function () {
      var broker;

      before(function () {
        broker = createBroker();
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

      it('broker loginMessageDelayMS delayed is set', function () {
        assert.equal(broker.attributes.loginMessageDelayMS, loginMessageDelayMS);
      });

      describe('`broker.fetch` is called', function () {
        before(function () {
          return broker.fetch();
        });

        it('has the `signup` capability', function () {
          assert.isTrue(broker.hasCapability('signup'));
        });

        it('`broker.SIGNUP_DISABLED_REASON` is not set', function () {
          assert.isUndefined(broker.SIGNUP_DISABLED_REASON);
        });

        it('does not have the `chooseWhatToSyncCheckbox` capability', function () {
          assert.isFalse(broker.hasCapability('chooseWhatToSyncCheckbox'));
        });
      });
    });
  });
});


