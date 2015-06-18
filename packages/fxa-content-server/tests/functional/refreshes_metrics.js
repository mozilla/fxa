/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'require',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, require, TestHelpers) {
  var AUTOMATED = '?automatedBrowser=true';
  var url = intern.config.fxaContentRoot + 'signup' + AUTOMATED;
  var signin = intern.config.fxaContentRoot + 'signin' + AUTOMATED;

  registerSuite({
    name: 'refreshing a screen logs a refresh event',

    beforeEach: function () {
      return TestHelpers.clearBrowserState(this);
    },

    'refreshing the signup screen': function () {
      var self = this;

      return this.remote
        .get(require.toUrl(url))
        .setFindTimeout(intern.config.pageLoadTimeout)

        .findById('fxa-signup-header')
        .end()

        .refresh()
        .findById('fxa-signup-header')
        .end()

        // Unload the page to flush the metrics
        .get(require.toUrl(signin))
        .findById('fxa-signin-header')

        .then(function () {
          return TestHelpers.testAreEventsLogged(self, ['screen.signup',
          'screen.signup', 'signup.refresh']);
        })
        .end();
    }
  });
});
