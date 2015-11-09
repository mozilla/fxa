/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A behavior that halts the view flow.
 */

define(function (require, exports, module) {
  'use strict';

  var p = require('lib/promise');

  var HaltBehavior = function () {
    var behavior = function (view) {
      // return a promise that never resolves to halt promise based flows.
      return p.defer().promise;
    };

    // used by form.afterSubmit to keep a form disabled.
    behavior.halt = true;

    return behavior;
  };

  module.exports = HaltBehavior;
});

