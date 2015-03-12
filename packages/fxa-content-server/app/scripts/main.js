/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

require([
  './require_config'
],
function () {
  // Ensure config is loaded before trying to load any other scripts.
  require(['./lib/app-start'], function (AppStart) {
    var appStart = new AppStart();
    appStart.startApp();
  });
});
