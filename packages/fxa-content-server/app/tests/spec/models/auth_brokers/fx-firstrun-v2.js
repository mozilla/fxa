/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const chai = require('chai');
  const Constants = require('lib/constants');
  const FxFirstrunV2AuthenticationBroker = require('models/auth_brokers/fx-firstrun-v2');
  const WindowMock = require('../../../mocks/window');

  var assert = chai.assert;

  describe('models/auth_brokers/fx-firstrun-v2', function () {
    var broker;
    var windowMock;

    before(function () {
      windowMock = new WindowMock();

      broker = new FxFirstrunV2AuthenticationBroker({
        window: windowMock
      });
    });

    it('has all sync content types', function () {
      assert.equal(broker.defaultCapabilities.chooseWhatToSyncWebV1.engines, Constants.DEFAULT_DECLINED_ENGINES);
    });

    describe('capabilities', function () {
      it('has the `chooseWhatToSyncWebV1` capability by default', function () {
        assert.isTrue(broker.hasCapability('chooseWhatToSyncWebV1'));
      });
    });
  });
});
