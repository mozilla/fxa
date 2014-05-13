/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require'
], function (intern, registerSuite, assert, require) {
  'use strict';

  var FROM_URL = 'https://github.com/mozilla/fxa-content-server';
  var FXA_ROOT_URL = intern.config.fxaContentRoot;

  registerSuite({
    name: 'back button after navigating to the root',

    'start at github, visit Fxa root, click `back` - should go back to github': function () {
      return this.get('remote')
        .get(require.toUrl(FROM_URL))
        .get(require.toUrl(FXA_ROOT_URL))

        .waitForElementById('fxa-signup-header')

        // click back.
        .back()

        .url()
          .then(function (resultUrl) {
            assert.equal(resultUrl, FROM_URL);
          })
        .end();
    }
  });
});
