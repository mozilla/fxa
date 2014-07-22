/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'require'
], function (intern, require) {
  'use strict';

  var config = intern.config;
  var CLEAR_URL = config.fxaContentRoot + 'clear';

  function clearBrowserState(context) {
    // clear localStorage to avoid polluting other tests.
    return context.get('remote')
      .get(require.toUrl(CLEAR_URL))
      .setFindTimeout(intern.config.pageLoadTimeout)
      .findById('fxa-clear-storage-header')
      .end();
  }

  return {
    clearBrowserState: clearBrowserState
  };
});

