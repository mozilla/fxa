/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'tests/functional/lib/helpers'
], function (registerSuite, assert, FunctionalHelpers) {

  var MIGRATE_PARAMS = 'state=state&migration=amo&scope=profile&email=fakeemail@restmail.com';

  registerSuite({
    name: 'oauth amo sign up',

    beforeEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'as a migrating user': function () {
      return FunctionalHelpers.openFxaFromRp(this, 'signup', MIGRATE_PARAMS)
        .then(FunctionalHelpers.visibleByQSA('.info.nudge'))
        .findByCssSelector('.info.nudge a')
          .click()
        .end()

        .findByCssSelector('#fxa-signin-header')
        .end()

        .findByCssSelector('input[type="email"]')
        .getAttribute('value')
        .then(function (resultText) {
          // check the email address is empty
          assert.equal(resultText, '');
        })
        .end();
    }
  });
});
