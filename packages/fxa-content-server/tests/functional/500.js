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

  var url = intern.config.fxaContentRoot + 'boom';

  registerSuite({
    name: '500',

    'visit an invalid page': function () {
      var expected = intern.config.fxaProduction ? 'fxa-404-home' : 'fxa-500-home';

      return this.get('remote')
        .get(require.toUrl(url))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .findById(expected)
          .click()
        .end()

        // success is going to the signup screen
        .findById('fxa-signup-header')
        .end();
    }
  });
});
