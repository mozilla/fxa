/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A behavior that halts if the browser transitions after
 * it detects an email verification. If browser does not
 * transition, `defaultBehavior` is returned instead.
 */

define(function (require, exports, module) {
  'use strict';

  const HaltBehavior = require('views/behaviors/halt');

  module.exports = function (defaultBehavior) {
    const behavior = function (view) {
      if (view.broker.getCapability('browserTransitionsAfterEmailVerification')) {
        return new HaltBehavior();
      }

      return defaultBehavior;
    };

    behavior.type = 'halt-if-browser-transitions';

    return behavior;
  };
});
