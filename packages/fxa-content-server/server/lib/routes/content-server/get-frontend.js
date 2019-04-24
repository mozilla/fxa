/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';
module.exports = function () {
  // The array is converted into a RegExp
  const FRONTEND_ROUTES = [
    'account_recovery_confirm_key',
    'account_recovery_reset_password',
    'authorization',
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
    'force_auth',
    'legal',
    'oauth',
    'oauth/force_auth',
    'oauth/signin',
    'oauth/signup',
    'pair',
    'pair/failure',
    'pair/success',
    'pair/supp',
    'pair/unsupported',
    'primary_email_verified',
    'report_signin',
    'reset_password',
    'reset_password_confirmed',
    'reset_password_verified',
    'reset_password_with_recovery_key_verified',
    'settings',
    'settings/account_recovery',
    'settings/account_recovery/confirm_password',
    'settings/account_recovery/confirm_revoke',
    'settings/account_recovery/recovery_key',
    'settings/avatar/camera',
    'settings/avatar/change',
    'settings/avatar/crop',
    'settings/change_password',
    'settings/clients',
    'settings/clients/disconnect',
    'settings/communication_preferences',
    'settings/delete_account',
    'settings/display_name',
    'settings/emails',
    'settings/two_step_authentication',
    'settings/two_step_authentication/recovery_codes',
    'signin',
    'signin_bounced',
    'signin_token_code',
    'signin_totp_code',
    'signin_recovery_code',
    'signin_confirmed',
    'signin_permissions',
    'signin_reported',
    'signin_unblock',
    'signin_verified',
    'signup',
    'signup_confirmed',
    'signup_permissions',
    'signup_verified',
    'secondary_email_verified',
    'sms',
    'sms/sent',
    'sms/why',
    'verify_email',
    'verify_primary_email',
    'verify_secondary_email'
  ].join('|'); // prepare for use in a RegExp

  return {
    method: 'get',
    path: new RegExp('^/(' + FRONTEND_ROUTES + ')/?$'),
    process: function (req, res, next) {
      // setting the url to / will use the correct
      // index.html for either dev or prod mode.
      req.url = '/';
      next();
    }
  };
};
