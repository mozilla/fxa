/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

require([
  './require_config',
  './lib/app-start'
],
function (RequireConfig, AppStart) {
  var appStart = new AppStart();
  appStart.startApp();
});
