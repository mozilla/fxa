/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Helper functions for views with migration-specific behaviour.
// Meant to be mixed into views.

define(function (require, exports, module) {
  'use strict';


  module.exports = {
    isMigration: function () {
      return this.relier.has('migration');
    }
  };
});
