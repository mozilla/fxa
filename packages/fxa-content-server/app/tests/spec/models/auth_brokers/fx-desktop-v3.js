/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var chai = require('chai');
  var FxDesktopV3AuthenticationBroker = require('models/auth_brokers/fx-desktop-v3');
  var WindowMock = require('../../../mocks/window');

  var assert = chai.assert;

  describe('models/auth_brokers/fx-desktop-v3', function () {
    var broker;
    var windowMock;

    before(function () {
      windowMock = new WindowMock();

      broker = new FxDesktopV3AuthenticationBroker({
        window: windowMock
      });
    });

    describe('capabilities', function () {
      it('has the `syncPreferencesNotification` capability', function () {
        assert.isTrue(broker.hasCapability('syncPreferencesNotification'));
      });
    });
  });
});
