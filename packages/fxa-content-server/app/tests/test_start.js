/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

require([
  'lib/translator',
  'lib/session',
  '../tests/setup'
],
function (Translator, Session) {
  'use strict';

  var tests = [
    '../tests/spec/lib/channels/duplex',
    '../tests/spec/lib/channels/fx-desktop-v1',
    '../tests/spec/lib/channels/iframe',
    '../tests/spec/lib/channels/inter-tab',
    '../tests/spec/lib/channels/null',
    '../tests/spec/lib/channels/web',
    '../tests/spec/lib/channels/receivers/postmessage',
    '../tests/spec/lib/channels/receivers/web-channel',
    '../tests/spec/lib/channels/senders/fx-desktop-v1',
    '../tests/spec/lib/channels/senders/web-channel',
    '../tests/spec/lib/experiments/base',
    '../tests/spec/lib/experiments/mailcheck',
    '../tests/spec/lib/experiments/open-gmail',
    '../tests/spec/lib/experiments/sync-checkbox',
    '../tests/spec/lib/xss',
    '../tests/spec/lib/url',
    '../tests/spec/lib/session',
    '../tests/spec/lib/fxa-client',
    '../tests/spec/lib/oauth-client',
    '../tests/spec/lib/assertion',
    '../tests/spec/lib/experiment',
    '../tests/spec/lib/translator',
    '../tests/spec/lib/router',
    '../tests/spec/lib/strings',
    '../tests/spec/lib/auth-errors',
    '../tests/spec/lib/oauth-errors',
    '../tests/spec/lib/profile-client',
    '../tests/spec/lib/app-start',
    '../tests/spec/lib/validate',
    '../tests/spec/lib/service-name',
    '../tests/spec/lib/screen-info',
    '../tests/spec/lib/metrics',
    '../tests/spec/lib/mailcheck',
    '../tests/spec/lib/storage-metrics',
    '../tests/spec/lib/null-metrics',
    '../tests/spec/lib/cropper',
    '../tests/spec/lib/image-loader',
    '../tests/spec/lib/xhr',
    '../tests/spec/lib/storage',
    '../tests/spec/lib/null-storage',
    '../tests/spec/lib/sentry',
    '../tests/spec/lib/relier-keys',
    '../tests/spec/lib/able',
    '../tests/spec/lib/environment',
    '../tests/spec/lib/base64url',
    '../tests/spec/lib/origin-check',
    '../tests/spec/lib/marketing-email-client',
    '../tests/spec/lib/height-observer',
    '../tests/spec/lib/config-loader',
    '../tests/spec/lib/require-on-demand',
    '../tests/spec/head/startup-styles',
    '../tests/spec/views/app',
    '../tests/spec/views/base',
    '../tests/spec/views/tooltip',
    '../tests/spec/views/form',
    '../tests/spec/views/sign_up',
    '../tests/spec/views/choose_what_to_sync',
    '../tests/spec/views/complete_sign_up',
    '../tests/spec/views/sign_in',
    '../tests/spec/views/oauth_sign_in',
    '../tests/spec/views/oauth_sign_up',
    '../tests/spec/views/force_auth',
    '../tests/spec/views/settings',
    '../tests/spec/views/settings/avatar',
    '../tests/spec/views/settings/avatar_change',
    '../tests/spec/views/settings/avatar_crop',
    '../tests/spec/views/settings/avatar_gravatar',
    '../tests/spec/views/settings/avatar_camera',
    '../tests/spec/views/settings/change_password',
    '../tests/spec/views/settings/communication_preferences',
    '../tests/spec/views/settings/delete_account',
    '../tests/spec/views/settings/display_name',
    '../tests/spec/views/settings/gravatar_permissions',
    '../tests/spec/views/sub_panels',
    '../tests/spec/views/confirm',
    '../tests/spec/views/permissions',
    '../tests/spec/views/tos',
    '../tests/spec/views/pp',
    '../tests/spec/views/reset_password',
    '../tests/spec/views/confirm_reset_password',
    '../tests/spec/views/complete_reset_password',
    '../tests/spec/views/ready',
    '../tests/spec/views/confirm_account_unlock',
    '../tests/spec/views/complete_account_unlock',
    '../tests/spec/views/cookies_disabled',
    '../tests/spec/views/clear_storage',
    '../tests/spec/views/unexpected_error',
    '../tests/spec/views/progress_indicator',
    '../tests/spec/views/marketing_snippet',
    '../tests/spec/views/marketing_snippet_ios',
    '../tests/spec/views/cannot_create_account',
    '../tests/spec/views/close_button',
    '../tests/spec/views/coppa/coppa-age-input',
    '../tests/spec/views/decorators/progress_indicator',
    '../tests/spec/views/behaviors/halt',
    '../tests/spec/views/behaviors/navigate',
    '../tests/spec/views/behaviors/null',
    '../tests/spec/views/mixins/floating-placeholder-mixin',
    '../tests/spec/views/mixins/experiment-mixin',
    '../tests/spec/views/mixins/timer-mixin',
    '../tests/spec/views/mixins/resume-token-mixin',
    '../tests/spec/views/mixins/service-mixin',
    '../tests/spec/views/mixins/settings-mixin',
    '../tests/spec/views/mixins/password-mixin',
    '../tests/spec/views/mixins/password-strength-mixin',
    '../tests/spec/views/mixins/avatar-mixin',
    '../tests/spec/views/mixins/back-mixin',
    '../tests/spec/views/mixins/account-locked-mixin',
    '../tests/spec/views/mixins/checkbox-mixin',
    '../tests/spec/views/mixins/inter-tab-channel-mixin',
    '../tests/spec/views/mixins/loading-mixin',
    '../tests/spec/views/mixins/migration-mixin',
    '../tests/spec/views/mixins/modal-settings-panel-mixin',
    '../tests/spec/views/mixins/settings-panel-mixin',
    '../tests/spec/views/mixins/signup-enabled-mixin',
    '../tests/spec/views/openid/login',
    '../tests/spec/views/openid/start',
    '../tests/spec/models/unique-user-id',
    '../tests/spec/models/user',
    '../tests/spec/models/account',
    '../tests/spec/models/profile-image',
    '../tests/spec/models/email-resend',
    '../tests/spec/models/form-prefill',
    '../tests/spec/models/marketing-email-prefs',
    '../tests/spec/models/notifications',
    '../tests/spec/models/oauth-token',
    '../tests/spec/models/refresh-observer',
    '../tests/spec/models/resume-token',
    '../tests/spec/models/mixins/resume-token',
    '../tests/spec/models/mixins/search-param',
    '../tests/spec/models/reliers/base',
    '../tests/spec/models/reliers/relier',
    '../tests/spec/models/reliers/oauth',
    '../tests/spec/models/reliers/sync',
    '../tests/spec/models/auth_brokers/base',
    '../tests/spec/models/auth_brokers/first-run',
    '../tests/spec/models/auth_brokers/fx-desktop-v1',
    '../tests/spec/models/auth_brokers/fx-desktop-v2',
    '../tests/spec/models/auth_brokers/fx-fennec-v1',
    '../tests/spec/models/auth_brokers/fx-ios-v1',
    '../tests/spec/models/auth_brokers/fx-ios-v2',
    '../tests/spec/models/auth_brokers/fx-sync',
    '../tests/spec/models/auth_brokers/iframe',
    '../tests/spec/models/auth_brokers/oauth',
    '../tests/spec/models/auth_brokers/redirect',
    '../tests/spec/models/auth_brokers/web-channel',
    '../tests/spec/models/verification/base',
    '../tests/spec/models/verification/sign-up',
    '../tests/spec/models/verification/reset-password'
  ];

  // The translator is expected to be on the window object.
  window.translator = new Translator('en-US', ['en-US']);

  var runTests = function () {
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

    runner.on('end', function () {
      // This is our hook to the Selenium tests that run
      // the mocha tests as part of the CI build.
      // The selenium test will wait until the #total-failures element exists
      // and check for "0"
      var failureEl = document.createElement('div');
      failureEl.setAttribute('id', 'total-failures');
      failureEl.innerHTML = runner.failures || '0';
      document.body.appendChild(failureEl);
    });
  };

  // Make sure to tests are loaded in proper order using Require.JS
  var index = 0;
  var loadTests = function () {
    var test = tests[index];
    index += 1;
    if (index === tests.length) {
      // run the tests after all of them have loaded
      require([test], runTests);
    } else {
      require([test], loadTests);
    }
  };

  loadTests();

});

