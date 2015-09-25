/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A behavior that navigates to a new screen.
 */

define([
], function () {
  'use strict';

  var NavigationBehavior = function (endpoint, options) {
    options = options || {};

    return function (view) {
      return view.navigate(endpoint, {
        error: options.error,
        success: options.success
      });
    };
  };

  return NavigationBehavior;
});

