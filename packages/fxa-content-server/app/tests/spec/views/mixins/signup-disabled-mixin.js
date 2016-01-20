/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var chai = require('chai');
  var SignUpDisabledMixin = require('views/mixins/signup-disabled-mixin');
  var sinon = require('sinon');

  var assert = chai.assert;

  describe('views/mixins/signup-disabled-mixin', function () {
    it('exports correct interface', function () {
      assert.lengthOf(Object.keys(SignUpDisabledMixin), 2);
      var publicInterface = [
        'isSignupDisabled',
        'getSignupDisabledReason'
      ];
      publicInterface.forEach(function (funcName) {
        assert.isFunction(SignUpDisabledMixin[funcName]);
      });
    });

    describe('isSignupDisabled', function () {
      var broker;
      var result;

      beforeEach(function () {
        broker = {
          hasCapability: sinon.spy(function () {
            return false;
          })
        };

        result = SignUpDisabledMixin.isSignupDisabled.call({ broker: broker });
      });

      it('calls this.broker.isSignupDisabled correctly', function () {
        assert.equal(broker.hasCapability.callCount, 1);

        assert.isTrue(result);
      });
    });

    describe('getSignupDisabledReason', function () {
      var broker;
      var result;

      beforeEach(function () {
        broker = {
          SIGNUP_DISABLED_REASON: AuthErrors.toError('IOS_SIGNUP_DISABLED')
        };

        result = SignUpDisabledMixin.getSignupDisabledReason.call({ broker: broker });
      });

      it('reports the correct value', function () {

        assert.isTrue(AuthErrors.is(result, 'IOS_SIGNUP_DISABLED'));
      });
    });
  });
});

