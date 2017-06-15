/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  './intern',
  './ci/select_circle_tests'
], function (intern, selectCircleTests) {

  intern.functionalSuites = selectCircleTests([
    'tests/functional/settings_secondary_emails.js',
    // flaky tests go above here.
    'tests/functional/avatar',
    'tests/functional/back_button_after_start',
    'tests/functional/bounced_email',
    'tests/functional/change_password',
    'tests/functional/complete_sign_in',
    'tests/functional/complete_sign_up',
    'tests/functional/confirm',
    'tests/functional/connect_another_device',
    'tests/functional/cookies_disabled',
    'tests/functional/delete_account',
    'tests/functional/force_auth',
    'tests/functional/fx_desktop_handshake',
    'tests/functional/fx_fennec_v1_force_auth',
    'tests/functional/fx_fennec_v1_sign_in',
    'tests/functional/fx_fennec_v1_sign_up',
    'tests/functional/fx_firstrun_v1_sign_in',
    'tests/functional/fx_firstrun_v1_sign_up',
    'tests/functional/fx_firstrun_v2_sign_up',
    'tests/functional/fx_ios_v1_sign_in',
    'tests/functional/fx_ios_v1_sign_up',
    'tests/functional/mob_android_v1',
    'tests/functional/mob_ios_v1',
    'tests/functional/mailcheck',
    'tests/functional/password_visibility',
    'tests/functional/refreshes_metrics',
    'tests/functional/reset_password',
    'tests/functional/robots_txt',
    'tests/functional/send_sms',
    'tests/functional/settings',
    'tests/functional/settings_clients',
    'tests/functional/settings_common',
    'tests/functional/sign_in',
    'tests/functional/sign_in_blocked',
    'tests/functional/sign_in_cached',
    'tests/functional/sign_up',
    'tests/functional/sync_reset_password',
    'tests/functional/sync_settings',
    'tests/functional/sync_sign_in',
    'tests/functional/sync_sign_up',
    'tests/functional/sync_v3_force_auth',
    'tests/functional/sync_v3_settings',
    'tests/functional/sync_v3_sign_in',
    'tests/functional/sync_v3_sign_up',
  ]);

  return intern;
});
