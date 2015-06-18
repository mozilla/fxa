/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require'
], function (intern, registerSuite, assert, require) {
  var FROM_URL = 'http://example.com/';
  var FXA_ROOT_URL = intern.config.fxaContentRoot;

  registerSuite({
    name: 'back button after navigating to the root',

    'start at github, visit Fxa root, click `back` - should go back to example': function () {
      return this.remote
        .get(require.toUrl(FROM_URL))
        .get(require.toUrl(FXA_ROOT_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .findById('fxa-signup-header')

        // click back.
        .goBack()

        .getCurrentUrl()
          .then(function (resultUrl) {
            assert.equal(resultUrl, FROM_URL);
          })
        .end();
    }
  });
});
