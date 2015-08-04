/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// View mixin with signup enabled/disabled behaviors.

define([], function () {
  'use strict';

  return {
    isSignupDisabled: function () {
      return this.broker.isSignupDisabled();
    },

    getSignupDisabledReason: function () {
      return this.broker.SIGNUP_DISABLED_REASON;
    }
  };
});
