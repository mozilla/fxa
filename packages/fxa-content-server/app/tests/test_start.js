/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* globals globalThis */

mocha.setup('bdd');
mocha.timeout(20000);

//import Translator from 'lib/app-start';
import Session from 'lib/session';

// The tests need to be included using `require` instead
// of import otherwise `describe` and other mocha methods are
// undefined when the modules are imported.
require('./spec/head/startup-styles');
require('./spec/lib/app-start');
require('./spec/lib/auth-errors');
require('./spec/lib/channels/duplex');
require('./spec/lib/channels/fx-desktop-v1');
require('./spec/lib/channels/inter-tab');
require('./spec/lib/channels/notifier');
require('./spec/lib/channels/notifier-mixin');
require('./spec/lib/channels/null');
require('./spec/lib/channels/receivers/postmessage');
require('./spec/lib/channels/receivers/web-channel');
require('./spec/lib/channels/senders/fx-desktop-v1');
require('./spec/lib/channels/senders/web-channel');
require('./spec/lib/channels/web');
require('./spec/lib/cocktail');
require('./spec/lib/config-loader');
require('./spec/lib/country-telephone-info');
require('./spec/lib/crypto/a256gcm');
require('./spec/lib/crypto/account-ecosystem-telemetry');
require('./spec/lib/crypto/base32');
require('./spec/lib/crypto/hkdf');
require('./spec/lib/crypto/recovery-keys');
require('./spec/lib/crypto/scoped-keys');
require('./spec/lib/crypto/util');
require('./spec/lib/dom-writer');
require('./spec/lib/email-domain-validator');
require('./spec/lib/environment');
require('./spec/lib/error-utils');
require('./spec/lib/experiment');
require('./spec/lib/experiments/base');
require('./spec/lib/experiments/grouping-rules/base');
require('./spec/lib/experiments/grouping-rules/communication-prefs');
require('./spec/lib/experiments/grouping-rules/index');
require('./spec/lib/experiments/grouping-rules/is-sampled-user');
require('./spec/lib/experiments/grouping-rules/newsletter-sync');
require('./spec/lib/experiments/grouping-rules/push');
require('./spec/lib/experiments/grouping-rules/send-sms-install-link');
require('./spec/lib/experiments/grouping-rules/sentry');
require('./spec/lib/fxa-client');
require('./spec/lib/image-loader');
require('./spec/lib/logger');
require('./spec/lib/metrics');
require('./spec/lib/null-metrics');
require('./spec/lib/null-storage');
require('./spec/lib/oauth-client');
require('./spec/lib/oauth-errors');
require('./spec/lib/pairing-channel-client');
require('./spec/lib/payment-server');
require('./spec/lib/profile-client');
require('./spec/lib/router');
require('./spec/lib/screen-info');
require('./spec/lib/sentry');
require('./spec/lib/session');
require('./spec/lib/sign-in-reasons');
require('./spec/lib/storage');
require('./spec/lib/storage-metrics');
require('./spec/lib/strings');
require('./spec/lib/transform');
require('./spec/lib/translator');
require('./spec/lib/url');
require('./spec/lib/url-mixin');
require('./spec/lib/user-agent');
require('./spec/lib/user-agent-mixin');
require('./spec/lib/validate');
require('./spec/lib/xhr');
require('./spec/lib/xss');
require('./spec/models/account');
require('./spec/models/attached-client');
require('./spec/models/attached-clients');
require('./spec/models/auth_brokers/base');
require('./spec/models/auth_brokers/fx-desktop-v3');
require('./spec/models/auth_brokers/fx-fennec-v1');
require('./spec/models/auth_brokers/fx-ios-v1');
require('./spec/models/auth_brokers/fx-sync');
require('./spec/models/auth_brokers/fx-sync-channel');
require('./spec/models/auth_brokers/fx-sync-web-channel');
require('./spec/models/auth_brokers/index');
require('./spec/models/auth_brokers/oauth-redirect');
require('./spec/models/auth_brokers/oauth-webchannel-v1');
require('./spec/models/auth_brokers/oauth-redirect-chrome-android');
require('./spec/models/auth_brokers/pairing/authority');
require('./spec/models/auth_brokers/pairing/remote-metadata');
require('./spec/models/auth_brokers/pairing/supplicant');
require('./spec/models/auth_brokers/pairing/supplicant-webchannel');
require('./spec/models/auth_brokers/pairing/mixins/supplicant');
require('./spec/models/auth_brokers/web');
require('./spec/models/email');
require('./spec/models/email-resend');
require('./spec/models/flow');
require('./spec/models/form-prefill');
require('./spec/models/mixins/resume-token');
require('./spec/models/mixins/url');
require('./spec/models/oauth-token');
require('./spec/models/pairing/authority-state-machine');
require('./spec/models/pairing/state');
require('./spec/models/pairing/state-machine');
require('./spec/models/pairing/supplicant-state-machine');
require('./spec/models/password_strength/password_strength_balloon');
require('./spec/models/polls/device-connected');
require('./spec/models/polls/session-verification');
require('./spec/models/profile-image');
require('./spec/models/recovery-code');
require('./spec/models/refresh-observer');
require('./spec/models/reliers/base');
require('./spec/models/reliers/oauth');
require('./spec/models/reliers/pairing/authority');
require('./spec/models/reliers/pairing/supplicant');
require('./spec/models/reliers/relier');
require('./spec/models/reliers/browser');
require('./spec/models/resume-token');
require('./spec/models/security-events');
require('./spec/models/subscription');
require('./spec/models/support-form');
require('./spec/models/sync-engines');
require('./spec/models/unique-user-id');
require('./spec/models/user');
require('./spec/models/verification/account-recovery');
require('./spec/models/verification/base');
require('./spec/models/verification/reset-password');
require('./spec/models/verification/report-sign-in');
require('./spec/models/verification/same-browser');
require('./spec/models/verification/sign-up');
require('./spec/views/account_recovery_confirm_key');
require('./spec/views/app');
require('./spec/views/authorization');
require('./spec/views/base');
require('./spec/views/behaviors/connect-another-device');
require('./spec/views/behaviors/halt');
require('./spec/views/behaviors/navigate');
require('./spec/views/behaviors/null');
require('./spec/views/cannot_create_account');
require('./spec/views/choose_what_to_sync');
require('./spec/views/clear_storage');
require('./spec/views/complete_reset_password');
require('./spec/views/complete_sign_up');
require('./spec/views/confirm');
require('./spec/views/confirm_reset_password');
require('./spec/views/confirm_signup_code');
require('./spec/views/connect_another_device');
require('./spec/views/cookies_disabled');
require('./spec/views/decorators/progress_indicator');
require('./spec/views/elements/coppa-age-input');
require('./spec/views/elements/tel-input');
require('./spec/views/elements/totp-code-input');
require('./spec/views/elements/otp-code-input');
require('./spec/views/elements/recovery-code-input');
require('./spec/views/elements/recovery-key-input');
require('./spec/views/force_auth');
require('./spec/views/form');
require('./spec/views/index');
require('./spec/views/marketing_snippet');
require('./spec/views/mixins/account-by-uid-mixin');
require('./spec/views/mixins/account-reset-mixin');
require('./spec/views/mixins/account-suggestion-mixin');
require('./spec/views/mixins/avatar-mixin');
require('./spec/views/mixins/back-mixin');
require('./spec/views/mixins/cached-credentials-mixin');
require('./spec/views/mixins/cwts-on-signup-password');
require('./spec/views/mixins/connect-another-device-mixin');
require('./spec/views/mixins/coppa-mixin');
require('./spec/views/mixins/device-connected-poll-mixin');
require('./spec/views/mixins/email-autocomplete-domains-mixin');
require('./spec/views/mixins/email-opt-in-mixin');
require('./spec/views/mixins/experiment-mixin');
require('./spec/views/mixins/external-links-mixin');
require('./spec/views/mixins/flow-begin-mixin');
require('./spec/views/mixins/flow-events-mixin');
require('./spec/views/mixins/form-prefill-mixin');
require('./spec/views/mixins/has-modal-child-view-mixin');
require('./spec/views/mixins/third-party-auth-mixin');
require('./spec/views/mixins/last-checked-time-mixin');
require('./spec/views/mixins/loading-mixin');
require('./spec/views/mixins/marketing-mixin');
require('./spec/views/mixins/modal-panel-mixin');
require('./spec/views/mixins/one-visible-of-type-mixin');
require('./spec/views/mixins/open-webmail-mixin');
require('./spec/views/mixins/pairing-graphics-mixin');
require('./spec/views/mixins/password-mixin');
require('./spec/views/mixins/password-reset-mixin');
require('./spec/views/mixins/password-strength-mixin');
require('./spec/views/mixins/pulse-graphic-mixin');
require('./spec/views/mixins/resend-mixin');
require('./spec/views/mixins/resume-token-mixin');
require('./spec/views/mixins/save-options-mixin');
require('./spec/views/mixins/service-mixin');
require('./spec/views/mixins/session-verification-poll-mixin');
require('./spec/views/mixins/session-verified-notification-mixin');
require('./spec/views/mixins/signed-in-notification-mixin');
require('./spec/views/mixins/signed-out-notification-mixin');
require('./spec/views/mixins/signin-mixin');
require('./spec/views/mixins/signup-mixin');
require('./spec/views/mixins/sms-mixin');
require('./spec/views/mixins/sync-auth-mixin');
require('./spec/views/mixins/sync-optional-mixin');
require('./spec/views/mixins/sync-suggestion-mixin');
require('./spec/views/mixins/timer-mixin');
require('./spec/views/mixins/user-card-mixin');
require('./spec/views/mixins/verification-reason-mixin');
require('./spec/views/pair/auth_allow');
require('./spec/views/pair/auth_totp');
require('./spec/views/pair/auth_complete');
require('./spec/views/pair/auth_wait_for_supp');
require('./spec/views/pair/device-being-paired-mixin');
require('./spec/views/pair/failure');
require('./spec/views/pair/unsupported');
require('./spec/views/pair/index');
require('./spec/views/pair/success');
require('./spec/views/pair/supp');
require('./spec/views/pair/supp_allow');
require('./spec/views/pair/supp_wait_for_auth');
require('./spec/views/password_strength/password_strength_balloon');
require('./spec/views/password_strength/password_with_strength_balloon');
require('./spec/views/permissions');
require('./spec/views/pp');
require('./spec/views/post_verify/account_recovery/add_recovery_key');
require('./spec/views/post_verify/account_recovery/confirm_password');
require('./spec/views/post_verify/account_recovery/save_recovery_key');
require('./spec/views/post_verify/account_recovery/confirm_recovery_key');
require('./spec/views/post_verify/cad_qr/get_started');
require('./spec/views/post_verify/cad_qr/ready_to_scan');
require('./spec/views/post_verify/cad_qr/scan_code');
require('./spec/views/post_verify/cad_qr/connected');
require('./spec/views/post_verify/finish_account_setup/set_password');
require('./spec/views/post_verify/newsletters/add_newsletters');
require('./spec/views/post_verify/password/force_password_change');
require('./spec/views/post_verify/secondary_email/add_secondary_email');
require('./spec/views/post_verify/secondary_email/confirm_secondary_email');
require('./spec/views/progress_indicator');
require('./spec/views/push/confirm_login');
require('./spec/views/push/send_login');
require('./spec/views/push/completed');
require('./spec/views/ready');
require('./spec/views/report_sign_in');
require('./spec/views/reset_password');
require('./spec/views/sign_in_bounced');
require('./spec/views/sign_in_password');
require('./spec/views/sign_in_recovery_code');
require('./spec/views/sign_in_reported');
require('./spec/views/sign_in_unblock');
require('./spec/views/sign_in_token_code');
require('./spec/views/sign_in_totp_code');
require('./spec/views/sign_up_password');
require('./spec/views/sms_send');
require('./spec/views/sms_sent');
require('./spec/views/subscriptions_management_redirect');
require('./spec/views/subscriptions_product_redirect');
require('./spec/views/support');
require('./spec/views/tooltip');
require('./spec/views/tos');
require('./spec/views/why_connect_another_device');

const runTests = function () {
  /**
   * Ensure session state does not pollute other tests
   */
  beforeEach(function () {
    Session.testClear();
  });

  afterEach(function () {
    Session.testClear();
  });

  var runner = mocha.run();
  globalThis.runner = runner;
  /**
   * Monkey patch runner.fail to clean the stack trace. Using
   * `runner.on('fail', ..` does not work because the callback
   * is run after $'s own callback which prints the stack
   * trace.
   */
  var _fail = runner.fail;
  runner.fail = function (test, err) {
    if (err && err.stack) {
      err.stack = cleanErrorStack(err);
    }
    return _fail.apply(this, arguments);
  };

  runner.on('end', function () {
    // This is our hook to the Selenium tests that run
    // the $ tests as part of the CI build.
    // The selenium test will wait until the #total-failures element exists
    // and check for "0"
    var failureEl = document.createElement('div');
    failureEl.setAttribute('id', 'total-failures');
    failureEl.innerHTML = runner.failures || '0';
    document.body.appendChild(failureEl);
  });
};

var filterFilesFromStack = ['tests/test_start.js'];

function shouldFilterLine(line) {
  for (var i = 0; i < filterFilesFromStack.length; ++i) {
    if (line.indexOf(filterFilesFromStack[i]) !== -1) {
      return true;
    }
  }

  return false;
}

function cleanErrorStack(err) {
  return err.stack
    .split('\n')
    .filter(function (line) {
      return !shouldFilterLine(line);
    })
    .join('\n');
}

runTests();
