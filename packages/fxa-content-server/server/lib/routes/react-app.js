/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * To serve a new page, add its route name to `alwaysOnRoutes`, or to a group
 * behind a `showReactApp` flag while the page is in development.
 *
 * Routes in a group with its flag off return the content-server 404.
 */
const alwaysOnRoutes = [
  // the order of the routes in the array is important.  do not put '/'
  // first.
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
  // Canonical SetPassword URL going forward (FXA-13475). The legacy
  // `post_verify/third_party_auth/set_password` URL below is kept
  // registered so in-flight bookmarks and redirects continue to
  // resolve through Express to the React app.
  'post_verify/set_password',
  'post_verify/third_party_auth/set_password',
  'post_verify/service_welcome',
  'update_firefox',
];

const webChannelExampleRoutes = ['web_channel_example'];

const pair2Routes = [
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
];

/** @param {string} name */
function toPath(name) {
  // Names that start with '/' are already Express paths, e.g. '/oauth/success/:clientId'
  return name.startsWith('/') ? name : new RegExp(`^/${name}/?$`);
}

/**
 * Add the React routes for fxa-settings to serve with `middleware`.
 * @param {import('express').Express} app
 * @param {import('express').RequestHandler} middleware
 * @param {{ get(key: 'showReactApp'): { webChannelExampleRoutes: boolean, pair2Routes: boolean } }} config
 */
function addReactRoutes(app, middleware, config) {
  const showReactApp = config.get('showReactApp');
  const routes = [
    ...alwaysOnRoutes,
    ...(showReactApp.webChannelExampleRoutes === true
      ? webChannelExampleRoutes
      : []),
    ...(showReactApp.pair2Routes === true ? pair2Routes : []),
  ];
  routes.forEach((name) => app.get(toPath(name), middleware));
}

module.exports = {
  addReactRoutes,
};
