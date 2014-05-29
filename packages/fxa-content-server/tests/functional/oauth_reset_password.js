/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/restmail',
  'tests/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, restmail, TestHelpers) {
  'use strict';

  var config = intern.config;
  //var OAUTH_APP = 'https://123done.dev.lcip.org/';
  var OAUTH_APP = config.fxaOauthApp;
  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;

  var PAGE_URL = config.fxaContentRoot + 'signin';
  var PASSWORD = 'password';
  var email;

  registerSuite({
    name: 'oauth reset password',

    setup: function () {
      email = TestHelpers.createEmail();
    },

    teardown: function () {
      // clear localStorage to avoid polluting other tests.
      // Without the clear, /signup tests fail because of the info stored
      // in prefillEmail
      return this.get('remote')
        .get(require.toUrl(PAGE_URL))
        .waitForElementById('fxa-signin-header')
        .safeEval('sessionStorage.clear(); localStorage.clear();');
    },

    'basic reset': function () {
      return this.get('remote')
        .get(require.toUrl(OAUTH_APP))
        .end();

      // TODO: Everything.

    }
  });

});
