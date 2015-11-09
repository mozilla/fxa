/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A behavior that navigates to a new view.
 */

define(function (require, exports, module) {
  'use strict';

  var p = require('lib/promise');

  var NavigationBehavior = function (endpoint, options) {
    options = options || {};

    var behavior = function (view) {
      view.navigate(endpoint, {
        data: options.data,
        error: options.error,
        success: options.success
      });

      // halt the flow after navigating.
      return p.defer().promise;
    };

    // used for testing
    behavior.endpoint = endpoint;
    behavior.halt = true;

    return behavior;
  };

  module.exports = NavigationBehavior;
});

