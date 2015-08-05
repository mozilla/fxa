/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, FunctionalHelpers) {
  var url = intern.config.fxaContentRoot + 'legal';

  registerSuite({
    name: 'legal',

    'start at legal page': function () {

      return this.remote
        .get(require.toUrl(url))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .findByCssSelector('a[href="/legal/terms"]')
          .click()
        .end()

        // success is going to the TOS screen
        .findByCssSelector('#fxa-tos-back')
          .click()
        .end()

        .findByCssSelector('a[href="/legal/privacy"]')
          .click()
        .end()

        .findByCssSelector('#fxa-pp-back')
          .click()
        .end()

        // success is going back to the legal screen.
        .findByCssSelector('#fxa-legal-header')
        .end();
    },

    'start at terms page': function () {

      return this.remote
        .setFindTimeout(intern.config.pageLoadTimeout)
        .get(require.toUrl(url + '/terms'))

        .findByCssSelector('#main-content')
        .end()

        .then(FunctionalHelpers.visibleByQSA('#legal-copy'))
        .findById('legal-copy')
          .getVisibleText()
          .then(function (resultText) {
            // the legal text shouldn't be empty
            assert.ok(resultText.trim().length);
          })
        .end();
    },

    'start at privacy page': function () {

      return this.remote
        .setFindTimeout(intern.config.pageLoadTimeout)
        .get(require.toUrl(url + '/privacy'))

        .findByCssSelector('#main-content')
        .end()

        .then(FunctionalHelpers.visibleByQSA('#legal-copy'))
        .findById('legal-copy')
          .getVisibleText()
          .then(function (resultText) {
            // the legal text shouldn't be empty
            assert.ok(resultText.trim().length);
          })
        .end();
    }
  });
});
