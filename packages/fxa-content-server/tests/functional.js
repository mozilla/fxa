/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const testsSettings = require('./functional_settings');
module.exports = testsSettings.concat([
  // new and flaky tests above here',
  // 'tests/functional/email_opt_in.js',
  // 'tests/functional/fx_desktop_handshake.js',

  // 'tests/functional/oauth_sign_up.js',
  // 'tests/functional/pages.js',
  // 'tests/functional/post_verify/force_password_change.js',
  // 'tests/functional/post_verify/account_recovery.js',
  // 'tests/functional/post_verify/secondary_email.js',
  // 'tests/functional/sign_in.js',
  // 'tests/functional/sign_in_blocked.js',
  // 'tests/functional/sync_v3_sign_up.js',
  // 'tests/functional/sync_v3_settings.js',

  // Disabled because of https://github.com/mozilla/fxa/issues/9863
  // 'tests/functional/verification_reminders.js',

  // These tests no longer adds value and have been removed as
  // part of the analysis in
  // https://docs.google.com/spreadsheets/d/11Wq-Y-ipeNFXqLHbr3GJCh_f_qEAG-CUuqBt5Dcnh5k/edit#gid=0
  // 'tests/functional/bounced_email.js',
  // 'tests/functional/sync_v1.js',
  // 'tests/functional/pp.js',
  // 'tests/functional/sync_v2.js',
  // 'tests/functional/fx_firstrun_v2.js',
  // 'tests/functional/tos.js',
  // 'tests/functional/confirm.js',
  //'tests/functional/fx_ios_v1_sign_in.js',
  //'tests/functional/fx_ios_v1_sign_up.js',
  //'tests/functional/oauth_query_param_validation.js',
  //'tests/functional/refreshes_metrics.js',
  //'tests/functional/fx_browser_relier.js',
  //'tests/functional/500.js',
  //'tests/functional/email_domain_mx_validation.js',
  //'tests/functional/post_verify/newsletters.js',
  //''tests/functional/robots_txt.js',
  //'tests/functional/push.js',
  //''tests/functional/back_button_after_start.js',

  // Disabled because this test migrated to Playwright
  // See `/functional-test`
  // 'tests/functional/oauth_handshake.js',
  // 'tests/functional/oauth_force_auth.js',
  // 'tests/functional/sync_v3_force_auth.js',
  // 'tests/functional/oauth_sign_in.js',
  //'tests/functional/subscriptions.js',
  //'tests/functional/support.js',
  // 'tests/functional/password_visibility.js',
  //'tests/functional/password_strength.js',
  //'tests/functional/avatar.js',
  //'tests/functional/settings/change_password.js',
  //'tests/functional/settings/connected_services_oauth_clients.js',
  //'tests/functional/settings/external_links.js',
  //'tests/functional/settings/recovery_key.js',
  //'tests/functional/settings/secondary_email.js',
  //'tests/functional/settings/two_step_auth.js',
  //'tests/functional/sign_up_with_code.js',
  //'tests/functional/sync_v3_email_first.js',
  // 'tests/functional/reset_password.js',
  //'tests/functional/oauth_reset_password.js',
  // 'tests/functional/legal.js',
  //'tests/functional/sign_in_cached.js',
  // 'tests/functional/cookies_disabled.js',
  //'tests/functional/sign_up.js',
  //'tests/functional/oauth_settings_clients.js',
  //'tests/functional/oauth_require_totp.js',
  //'tests/functional/force_auth.js',
  //'tests/functional/sync_v3_sign_in.js',
  //'tests/functional/sync_v3_reset_password.js',
  //'tests/functional/oauth_sync_sign_in.js',
  //'tests/functional/oauth_permissions.js',
  //'tests/functional/oauth_prompt_none.js',
]);

// Mocha tests are only exposed during local dev, not on prod-like
// instances such as latest, stable, stage, and prod. To avoid
// Teamcity failing trying to run mocha tests, expose an environment
// variable it can use to skip the mocha tests.
if (!process.env.SKIP_MOCHA) {
  module.exports.unshift('tests/functional/mocha.js');
}
