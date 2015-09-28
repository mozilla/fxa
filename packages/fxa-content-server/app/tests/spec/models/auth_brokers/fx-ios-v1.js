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

    function createBroker () {
      broker = new FxiOSAuthenticationBroker({
        channel: channel,
        relier: relier,
        window: windowMock
      });
    }

    beforeEach(function () {
      channel = new NullChannel();
      relier = new Relier();
      windowMock = new WindowMock();
    });

    describe('isSignupDisabled', function () {
      it('returns `true` if `exclude_signup=1` is specified, a reason is provided', function () {
        windowMock.location.search = '?exclude_signup=1';
        createBroker();

        return broker.fetch()
          .then(function () {
            assert.isTrue(broker.isSignupDisabled());
            assert.ok(broker.SIGNUP_DISABLED_REASON);
          });
      });

      it('returns `false` otherwise', function () {
        windowMock.location.search = '';
        createBroker();

        return broker.fetch()
          .then(function () {
            assert.isFalse(broker.isSignupDisabled());
          });
      });
    });

  });
});


