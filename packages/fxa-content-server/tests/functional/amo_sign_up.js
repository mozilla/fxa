/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');

var QUERY_PARAMS = {
  migration: 'amo',
  scope: 'profile',
  state: 'state'
};

var clearBrowserState = FunctionalHelpers.clearBrowserState;
var click = FunctionalHelpers.click;
var fillOutSignIn = FunctionalHelpers.fillOutSignIn;
var openFxaFromRp = FunctionalHelpers.openFxaFromRp;
var testElementExists = FunctionalHelpers.testElementExists;
var visibleByQSA = FunctionalHelpers.visibleByQSA;

registerSuite('oauth amo authentication', {
  beforeEach: function () {
    return this.remote.then(clearBrowserState());
  },

  tests: {
    'sign up as a migrating user': function () {
      return this.remote
        .then(openFxaFromRp('signup', {query: QUERY_PARAMS}))
        .then(visibleByQSA('#amo-migration'));
    },

    'open sign in as a migrating user, click `/signup` from help text': function () {
      return this.remote
        .then(openFxaFromRp('signin', {query: QUERY_PARAMS}))
        .then(visibleByQSA('#amo-migration'))
        .then(click('#amo-migration a'))

        .then(testElementExists('#fxa-signup-header'));
    },

    'open sign in as a migrating user, click `/signup` from error text': function () {
      var email = TestHelpers.createEmail();

      return this.remote
        .then(openFxaFromRp('signin', {query: QUERY_PARAMS}))
        .then(visibleByQSA('#amo-migration'))

        .then(fillOutSignIn(email, 'password'))

        .then(visibleByQSA('.error'))
        .then(click('.error a'))

        .then(testElementExists('#fxa-signup-header'));
    }
  }
});
