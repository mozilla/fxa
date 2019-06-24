/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
var url = intern._config.fxaContentRoot;

var pages = [
  '',
  'authorization',
  'boom',
  'cannot_create_account',
  'choose_what_to_sync',
  'clear',
  'complete_reset_password',
  'complete_signin',
  'confirm',
  'confirm_reset_password',
  'confirm_signin',
  'connect_another_device',
  'connect_another_device/why',
  'cookies_disabled',
  // valid locale legal pages
  'en/legal/terms',
  'en/legal/privacy',
  'force_auth',
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
  'report_signin',
  'reset_password',
  'reset_password_confirmed',
  'reset_password_complete', // redirects to reset_password_verified
  'reset_password_verified',
  'settings',
  'settings/avatar',
  'settings/avatar/camera',
  'settings/avatar/change',
  'settings/avatar/crop',
  'settings/change_password',
  'settings/clients',
  'settings/communication_preferences',
  'settings/delete_account',
  'settings/display_name',
  'signin',
  'signin_bounced',
  'signin_confirmed',
  'signin_complete', // redirects to signin_verified
  'signin_permissions',
  'signin_reported',
  'signin_unblock',
  'signin_verified',
  'signup',
  'signup_confirmed',
  'signup_complete', // redirects to signup_verified
  'signup_permissions',
  'signup_verified',
  'sms',
  'sms/sent',
  'sms/sent/why',
  'sms/why',
  'verify_email',
  'v1/complete_reset_password',
  'v1/reset_password',
  'v1/verify_email',
];

var suite = {};

var visitFn = function(path) {
  return function() {
    return this.remote
      .get(url + path)
      .setFindTimeout(intern._config.pageLoadTimeout)
      .findByCssSelector('#stage header')
      .end();
  };
};

pages.forEach(function(path) {
  suite['visit page ' + url + path] = visitFn(path);
  suite['visit page ' + url + path + '/'] = visitFn(path + '/');
});

registerSuite('pages', suite);
