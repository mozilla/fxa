/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  './intern'
], function (intern) {

  intern.functionalSuites = [
    'tests/functional/sign_in',
    'tests/functional/sign_in_cached',
    'tests/functional/sync_sign_in',
    'tests/functional/sign_up',
    'tests/functional/complete_sign_up',
    'tests/functional/sync_sign_up',
    'tests/functional/sync_v2_sign_up',
    'tests/functional/verification_experiments',
    'tests/functional/bounced_email',
    'tests/functional/firstrun_sign_up',
    'tests/functional/firstrun_sign_in',
    'tests/functional/fx_ios_v1_sign_in',
    'tests/functional/fx_ios_v1_sign_up',
    'tests/functional/fx_ios_v2_sign_up',
    'tests/functional/fx_fennec_v1_sign_in',
    'tests/functional/fx_fennec_v1_force_auth',
    'tests/functional/fx_fennec_v1_sign_up',
    'tests/functional/confirm',
    'tests/functional/delete_account',
    'tests/functional/reset_password',
    'tests/functional/sync_reset_password',
    'tests/functional/robots_txt',
    'tests/functional/settings',
    'tests/functional/settings_common',
    'tests/functional/sync_settings',
    'tests/functional/change_password',
    'tests/functional/force_auth',
    'tests/functional/back_button_after_start',
    'tests/functional/cookies_disabled',
    'tests/functional/password_visibility'
  ];

  return intern;
});
