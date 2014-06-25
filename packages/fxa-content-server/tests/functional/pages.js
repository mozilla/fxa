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

  var url = intern.config.fxaContentRoot;

  var pages = [
    'v1/complete_reset_password',
    'v1/verify_email',
    '',
    'signin',
    'signin_complete',
    'signup',
    'signup_complete',
    'cannot_create_account',
    'verify_email',
    'confirm',
    'settings',
    'change_password',
    'legal',
    // legal are all redirected to the language detected
    // by sniffing headers, barring that, using en-US as
    // the fallback.
    'legal/terms',
    'legal/privacy',
    // invalid-locale should be redirected to en-US
    'invalid-locale/legal/terms',
    'invalid-locale/legal/privacy',
    // yay!
    'en-US/legal/terms',
    'en-US/legal/privacy',
    'reset_password',
    'confirm_reset_password',
    'complete_reset_password',
    'reset_password_complete',
    'force_auth',
    'delete_account',
    'non_existent',
    'cookies_disabled',
    'clear',
    'boom'
  ];

  var suite = {
    name: 'pages'
  };

  var visitFn = function (path) {
    return function () {
      return this.get('remote')
        .get(require.toUrl(url + path))
        .waitForElementByCssSelector('#stage header')
        .end();
    };
  };

  pages.forEach(function (path) {
    suite['visit page ' + url + path] = visitFn(path);
    suite['visit page ' + url + path + '/'] = visitFn(path + '/');
  });

  registerSuite(suite);
});
