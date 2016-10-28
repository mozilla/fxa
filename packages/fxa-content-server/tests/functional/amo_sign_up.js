/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'tests/functional/lib/helpers'
], function (registerSuite, FunctionalHelpers) {

  var QUERY_PARAMS = {
    email: 'fakeemail@restmail.com',
    migration: 'amo',
    scope: 'profile',
    state: 'state'
  };

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var click = FunctionalHelpers.click;
  var openFxaFromRp = thenify(FunctionalHelpers.openFxaFromRp);
  var testElementExists = FunctionalHelpers.testElementExists;
  var testElementValueEquals = FunctionalHelpers.testElementValueEquals;
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  registerSuite({
    name: 'oauth amo sign up',

    beforeEach: function () {
      return this.remote.then(clearBrowserState());
    },

    'as a migrating user': function () {
      return this.remote
        .then(openFxaFromRp(this, 'signup', { query: QUERY_PARAMS }))
        .then(visibleByQSA('.info.nudge'))
        .then(click('.info.nudge a'))

        .then(testElementExists('#fxa-signin-header'))
        .then(testElementValueEquals('input[type="email"]', ''));
    }
  });
});
