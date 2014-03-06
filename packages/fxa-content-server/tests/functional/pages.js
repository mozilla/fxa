/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'require'
], function (registerSuite, assert, require) {
  'use strict';

  var url = 'http://localhost:3030/';

  var pages = [
    'v1/complete_reset_password',
    'v1/verify_email',
    '',
    'signin',
    'signin_complete',,
    'signup',
    'signup_complete',,
    'cannot_create_account',
    'verify_email',
    'confirm',
    'settings',
    'change_password',
    'legal',
    'legal/terms',
    'legal/privacy',
    'reset_password',
    'confirm_reset_password',
    'complete_reset_password',
    'reset_password_complete',
    'force_auth',
    'non_existent'
  ];

  var suite = {
    name: 'pages'
  };

  var visitFn = function (path) {
    return function () {
      return this.get('remote')
        .get(require.toUrl(url + path))
        .waitForElementById('stage')
        .end();
    };
  };

  pages.forEach(function (path) {
    suite['visit page ' + url + path] = visitFn(path);
    suite['visit page ' + url + path + '/'] = visitFn(path + '/');
  });

  registerSuite(suite);
});
