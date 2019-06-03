/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Select which tests to run on circleci.
 *
 * If CIRCLE_NODE_TOTAL and CIRCLE_NODE_INDEX environment vars are defined,
 * tests are parallelized into CIRCLE_NODE_TOTAL runners. The suites are not
 * exactly the same size and will take a different amount of time to run,
 * but this is a good place to start.
 */
function selectCircleTests (allTests) {
  var testsToRun = allTests;

  if (process.env.CIRCLE_NODE_TOTAL) {
    console.log('CIRCLE_NODE_INDEX', process.env.CIRCLE_NODE_INDEX);
    console.log('CIRCLE_NODE_TOTAL', process.env.CIRCLE_NODE_TOTAL);

    var circleTotal = parseInt(process.env.CIRCLE_NODE_TOTAL, 10);
    var circleIndex = parseInt(process.env.CIRCLE_NODE_INDEX, 10);

    testsToRun = allTests.filter((test, index) => {
      var passes = (index % circleTotal) === circleIndex;
      return passes;
    });
  }

  return testsToRun;
}

module.exports = selectCircleTests([
  'tests/functional/sign_in_token_code.js',
  'tests/functional/email_service.js',
  'tests/functional/sign_in_totp.js',
  'tests/functional/recovery_key.js',
  // flaky tests go above here.
  'tests/functional/avatar.js',
  'tests/functional/back_button_after_start.js',
  'tests/functional/bounced_email.js',
  'tests/functional/change_password.js',
  'tests/functional/complete_sign_in.js',
  'tests/functional/complete_sign_up.js',
  'tests/functional/confirm.js',
  'tests/functional/connect_another_device.js',
  'tests/functional/cookies_disabled.js',
  'tests/functional/fx_desktop_handshake.js',
  'tests/functional/fx_fennec_v1_email_first.js',
  'tests/functional/fx_fennec_v1_force_auth.js',
  'tests/functional/fx_fennec_v1_sign_in.js',
  'tests/functional/fx_fennec_v1_sign_up.js',
  'tests/functional/fx_firstrun_v2.js',
  'tests/functional/fx_ios_v1_email_first.js',
  'tests/functional/fx_ios_v1_sign_in.js',
  'tests/functional/fx_ios_v1_sign_up.js',
  'tests/functional/mocha.js',
  'tests/functional/password_strength.js',
  'tests/functional/refreshes_metrics.js',
  'tests/functional/reset_password.js',
  'tests/functional/robots_txt.js',
  'tests/functional/send_sms.js',
  'tests/functional/settings.js',
  'tests/functional/settings_change_email.js',
  'tests/functional/settings_clients.js',
  'tests/functional/settings_common.js',
  'tests/functional/settings_secondary_emails.js',
  'tests/functional/sign_in.js',
  'tests/functional/sign_in_blocked.js',
  'tests/functional/sign_in_cached.js',
  'tests/functional/sign_in_recovery_code.js',
  'tests/functional/sign_up.js',
  'tests/functional/sync_v3_email_first.js',
  'tests/functional/sync_v3_force_auth.js',
  'tests/functional/sync_v3_reset_password.js',
  'tests/functional/sync_v3_settings.js',
  'tests/functional/sync_v3_sign_in.js',
  'tests/functional/sync_v3_sign_up.js',
]);
