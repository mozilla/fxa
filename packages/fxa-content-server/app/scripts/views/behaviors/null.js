/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A placeholder behavior, does nothing.
 */

define(function (require, exports, module) {
  'use strict';


  var NullBehavior = function () {
    var behavior = function (/*view*/) {
      // do nothing
    };

    return behavior;
  };

  module.exports = NullBehavior;
});

