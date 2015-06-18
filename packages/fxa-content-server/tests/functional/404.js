/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'require'
], function (intern, registerSuite, require) {
  var url = intern.config.fxaContentRoot + 'four-oh-four';

  registerSuite({
    name: '404',

    'visit an invalid page': function () {

      return this.remote
        .get(require.toUrl(url))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .findById('fxa-404-home')
          .click()
        .end()

        // success is going to the signup screen
        .findById('fxa-signup-header')
        .end();
    }
  });
});
