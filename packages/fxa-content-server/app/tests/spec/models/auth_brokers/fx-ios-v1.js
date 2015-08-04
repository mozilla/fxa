/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'chai',
  'lib/channels/null',
  'models/auth_brokers/fx-ios-v1',
  'models/reliers/relier',
  '../../../mocks/window'
],
function (chai, NullChannel, FxiOSAuthenticationBroker, Relier, WindowMock) {
  'use strict';

  var assert = chai.assert;

  describe('models/auth_brokers/fx-ios-v1', function () {
    var broker;
    var channel;
    var relier;
    var windowMock;

    beforeEach(function () {
      channel = new NullChannel();
      relier = new Relier();
      windowMock = new WindowMock();

      broker = new FxiOSAuthenticationBroker({
        relier: relier,
        window: windowMock,
        channel: channel
      });
    });

    describe('isSignupDisabled', function () {
      it('returns `true` by default, a reason is provided', function () {
        assert.isTrue(broker.isSignupDisabled());
        assert.ok(broker.SIGNUP_DISABLED_REASON);
      });
    });

  });
});


