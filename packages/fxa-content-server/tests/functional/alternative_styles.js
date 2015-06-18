/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/functional/lib/helpers',
  'tests/functional/lib/test',
  'require'
], function (intern, registerSuite, FunctionalHelpers, Test, require) {
  var INVALID_CHROMELESS_URL = intern.config.fxaContentRoot + 'signup?style=chromeless';
  var CHROMELESS_IFRAME_SYNC_URL = intern.config.fxaContentRoot + 'signup?service=sync&context=iframe&style=chromeless';

  registerSuite({
    name: 'alternate styles',

    beforeEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'the `chromeless` style is not applied if not iframed sync': function () {

      return this.remote
        .get(require.toUrl(INVALID_CHROMELESS_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .findByCssSelector('#fxa-signup-header')
        .end()

        .then(Test.noElementByCssSelector(this, '.chromeless'))

        .end();
    },

    'the `chromeless` style can be applied to an iframed sync': function () {

      return this.remote
        .get(require.toUrl(CHROMELESS_IFRAME_SYNC_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .findByCssSelector('#fxa-signup-header')
        .end()

        .findByCssSelector('.chromeless')
        .end();
    }
  });
});
