/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
var url = intern._config.fxaContentRoot;

// Commented out pages here likely mean the React version is rolled out to 100%
// and we don't want to check these for `#stage header` selectors.
var pages = [
  '',
  'authorization',
  'boom',
  'choose_what_to_sync',
  'complete_reset_password',
  'complete_signin',
  'confirm',
  'confirm_reset_password',
  'confirm_signin',
  'connect_another_device',
  'force_auth',
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
  'support',
  'verify_email',
  'v1/complete_reset_password',
  'v1/reset_password',
  'v1/verify_email',
];

var suite = {};

var visitFn = function (path) {
  return function () {
    return this.remote
      .get(url + path)
      .setFindTimeout(intern._config.pageLoadTimeout)
      .findByCssSelector('#stage header')
      .end();
  };
};

pages.forEach(function (path) {
  suite['visit page ' + url + path] = visitFn(path);
  suite['visit page ' + url + path + '/'] = visitFn(path + '/');
});

registerSuite('pages', suite);
