/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'tests/functional/lib/helpers',
], function (intern, registerSuite, assert, FunctionalHelpers) {
  var url = intern.config.fxaContentRoot + 'legal';

  registerSuite({
    name: 'legal',

    'start at legal page': function () {

      return FunctionalHelpers.openPage(this, url, '#fxa-legal-header')

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

      return FunctionalHelpers.openPage(this, url + '/terms', '#fxa-tos-header')

        .then(FunctionalHelpers.visibleByQSA('#legal-copy[data-shown]'))
        .findByCssSelector('#legal-copy[data-shown]')

          .getVisibleText()
          .then(function (resultText) {
            // the legal text shouldn't be empty
            assert.ok(resultText.trim().length);
          })
        .end();
    },

    'start at privacy page': function () {

      return FunctionalHelpers.openPage(this, url + '/privacy', '#fxa-pp-header')

        .then(FunctionalHelpers.visibleByQSA('#legal-copy[data-shown]'))
        .findByCssSelector('#legal-copy[data-shown]')
          .getVisibleText()
          .then(function (resultText) {
            // the legal text shouldn't be empty
            assert.ok(resultText.trim().length);
          })
        .end();
    }
  });
});
