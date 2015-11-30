/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'require'
], function (intern, registerSuite, require) {
  var url = intern.config.fxaContentRoot;

  var pages = [
    '',
    'account_unlock_complete',
    'boom',
    'cannot_create_account',
    'choose_what_to_sync',
    'clear',
    'complete_reset_password',
    'complete_unlock_account',
    'confirm',
    'confirm_account_unlock',
    'confirm_reset_password',
    'cookies_disabled',
    // valid locale legal pages
    'en/legal/terms',
    'en/legal/privacy',
    'force_auth',
    'force_auth_complete',
    // invalid locale legal pages should be redirected to en-US
    'invalid-locale/legal/terms',
    'invalid-locale/legal/privacy',
    'legal',
    // legal are all redirected to the language detected
    // by sniffing headers, barring that, using en-US as
    // the fallback.
    'legal/terms',
    'legal/privacy',
    'non_existent',
    'oauth',
    'oauth/force_auth',
    'oauth/signin',
    'oauth/signup',
    'reset_password',
    'reset_password_complete',
    'settings',
    'settings/avatar',
    'settings/avatar/camera',
    'settings/avatar/change',
    'settings/avatar/crop',
    'settings/avatar/gravatar',
    'settings/avatar/gravatar_permissions',
    'settings/change_password',
    'settings/communication_preferences',
    'settings/delete_account',
    'settings/devices',
    'settings/display_name',
    'signin',
    'signin_complete',
    'signin_permissions',
    'signup',
    'signup_complete',
    'signup_permissions',
    'unexpected_error',
    'verify_email',
    'v1/complete_reset_password',
    'v1/complete_unlock_account',
    'v1/reset_password',
    'v1/verify_email',
  ];

  var suite = {
    name: 'pages'
  };

  var visitFn = function (path) {
    return function () {
      return this.remote
        .get(require.toUrl(url + path))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .findByCssSelector('#stage header')
        .end();
    };
  };

  pages.forEach(function (path) {
    suite['visit page ' + url + path] = visitFn(path);
    suite['visit page ' + url + path + '/'] = visitFn(path + '/');
  });

  registerSuite(suite);
});
