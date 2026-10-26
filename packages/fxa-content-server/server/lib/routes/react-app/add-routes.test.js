/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const sinon = require('sinon');
const { addAllReactRoutesConditionally } = require('./add-routes');

const ALWAYS_ON_PATHS = [
  'authorization',
  'oauth',
  '/',
  'clear',
  'cookies_disabled',
  'reset_password',
  'complete_reset_password',
  'confirm_reset_password',
  'confirm_totp_reset_password',
  'confirm_backup_code_reset_password',
  'reset_password_recovery_phone',
  'reset_password_totp_recovery_choice',
  'reset_password_verified',
  'reset_password_with_recovery_key_verified',
  'account_recovery_confirm_key',
  'account_recovery_reset_password',
  'signin',
  'oauth/signin',
  'oauth/force_auth',
  'signin_passkey_fallback',
  'signin_token_code',
  'signin_totp_code',
  'signin_permissions',
  'signin_reported',
  'signin_confirmed',
  'signin_verified',
  'signin_bounced',
  'report_signin',
  'complete_signin',
  'signin_unblock',
  'force_auth',
  'signin_recovery_code',
  'signin_recovery_choice',
  'signin_recovery_phone',
  'inline_totp_setup',
  'inline_recovery_setup',
  'inline_recovery_key_setup',
  'inline_passwordless_sync_setup',
  'signin_passwordless_code',
  'oauth/signin_passwordless_code',
  'signup',
  'confirm_signup_code',
  'primary_email_verified',
  'signup_confirmed',
  'signup_verified',
  'signup_confirmed_sync',
  'oauth/signup',
  'pair',
  'pair/supp',
  'pair/supp/allow',
  'pair/supp/wait_for_auth',
  'pair/supp/complete',
  'pair/success',
  'pair/auth/allow',
  'pair/auth/wait_for_supp',
  'pair/auth/complete',
  'pair/auth/totp',
  'pair/failure',
  'pair/unsupported',
  'connect_another_device',
  '/oauth/success/:clientId',
  'post_verify/password/force_password_change',
  'subscriptions',
  'post_verify/third_party_auth/callback',
  'post_verify/set_password',
  'post_verify/third_party_auth/set_password',
  'post_verify/service_welcome',
  'update_firefox',
].map(toExpressPath);

const WEB_CHANNEL_EXAMPLE_PATHS = ['web_channel_example'].map(toExpressPath);

const PAIR2_PATHS = [
  'pair/authority/approve_signin',
  'pair/authority/continue_on_mobile',
  'pair/authority/download_firefox',
  'pair/authority/scan_qr',
  'pair/authority/sync_success',
  'pair/authority/timeout_and_cancel',
  'pair/authority/totp',
  'pair/supplicant/approve_signin',
  'pair/supplicant/connect_hint',
  'pair/supplicant/connect_this_device',
  'pair/supplicant/download_firefox',
  'pair/supplicant/ready_to_scan',
  'pair/supplicant/sync_success',
  'pair/supplicant/timeout_and_cancel',
].map(toExpressPath);

// Same conversion as react-route-server.js, as a string so paths compare.
function toExpressPath(name) {
  return name.startsWith('/') ? name : String(new RegExp(`^/${name}/?$`));
}

describe('react-app/add-routes:', () => {
  let app, middleware;

  function registeredPaths(showReactApp) {
    const config = {
      get: sinon.stub().withArgs('showReactApp').returns(showReactApp),
    };
    addAllReactRoutesConditionally(app, middleware, config);
    return app.get.args.map(([path]) => String(path));
  }

  beforeEach(() => {
    app = { get: sinon.spy() };
    middleware = sinon.spy();
  });

  it('registers only the always-on routes, in order, when the flags are off', () => {
    const paths = registeredPaths({
      webChannelExampleRoutes: false,
      pair2Routes: false,
    });

    assert.deepEqual(paths, ALWAYS_ON_PATHS);
    assert.isTrue(app.get.alwaysCalledWith(sinon.match.any, middleware));
  });

  it('registers webChannelExampleRoutes when its flag is on', () => {
    const paths = registeredPaths({
      webChannelExampleRoutes: true,
      pair2Routes: false,
    });

    assert.deepEqual(paths, [...ALWAYS_ON_PATHS, ...WEB_CHANNEL_EXAMPLE_PATHS]);
  });

  it('registers pair2Routes when its flag is on', () => {
    const paths = registeredPaths({
      webChannelExampleRoutes: false,
      pair2Routes: true,
    });

    assert.deepEqual(paths, [...ALWAYS_ON_PATHS, ...PAIR2_PATHS]);
  });
});
