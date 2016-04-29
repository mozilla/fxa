/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var assert = require('chai').assert;
  var SIGN_IN_REASONS = require('lib/sign-in-reasons');

  describe('lib/sign-in-reasons', function () {
    it('exports correct strings', function () {
      assert.lengthOf(Object.keys(SIGN_IN_REASONS), 5);
      assert.equal(SIGN_IN_REASONS.ACCOUNT_UNLOCK, 'account_unlock');
      assert.equal(SIGN_IN_REASONS.PASSWORD_CHANGE, 'password_change');
      assert.equal(SIGN_IN_REASONS.PASSWORD_CHECK, 'password_check');
      assert.equal(SIGN_IN_REASONS.PASSWORD_RESET, 'password_reset');
      assert.equal(SIGN_IN_REASONS.SIGN_IN, 'signin');
    });
  });
});

