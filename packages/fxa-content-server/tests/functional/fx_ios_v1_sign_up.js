/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop'
], function (intern, registerSuite, FunctionalHelpers, FxDesktopHelpers) {
  var config = intern.config;
  var PAGE_URL = config.fxaContentRoot + 'signup?context=fx_ios_v1&service=sync';

  var listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;

  registerSuite({
    name: 'FxiOS v1 sign_up',

    beforeEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'user is redirected to /signin and shown an error message': function () {
      var self = this;
      return FunctionalHelpers.openPage(self, PAGE_URL, '#fxa-signin-header')
        .execute(listenForFxaCommands)

        // an error is visible
        .then(FunctionalHelpers.visibleByQSA('.error'))

        .then(FunctionalHelpers.noSuchElement(self, 'a[href="/signup"]'));
    }
  });
});
