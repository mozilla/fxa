/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * Routes being conditionally served to the React application can't live in
 * the `routes/get-<whatever>.js` files because those files import route definitions,
 * and the client's `getReactRouteGroups` usage in `router.js` cannot import anything
 * with route definitions since some contain server-side imports and logic.
 */

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
  'confirm_signup_code',
  'connect_another_device',
  'cookies_disabled',
  'force_auth',
  'inline_totp_setup',
  'inline_recovery_setup',
  'inline_recovery_key_setup', // React app only
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
  'post_verify/cad_qr/get_started',
  'post_verify/cad_qr/ready_to_scan',
  'post_verify/cad_qr/scan_code',
  'post_verify/cad_qr/connected',
  'post_verify/finish_account_setup/set_password',
  'post_verify/newsletters/add_newsletters',
  'post_verify/password/force_password_change',
  'post_verify/secondary_email/add_secondary_email',
  'post_verify/secondary_email/confirm_secondary_email',
  'post_verify/secondary_email/verified_secondary_email',
  'post_verify/third_party_auth/callback',
  'post_verify/third_party_auth/set_password',
  'primary_email_verified',
  'push/completed',
  'push/confirm_login',
  'push/send_login',
  'report_signin',
  'reset_password',
  'reset_password_confirmed',
  'reset_password_verified',
  'reset_password_with_recovery_key_verified',
  'security_events',
  'signin',
  'signin_bounced',
  'signin_token_code',
  'signin_push_code',
  'signin_push_code_confirm',
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
  'subscriptions',
  'subscriptions/products/[\\w_]+',
  'support',
  'verify_email',
  'verify_primary_email',
  'verify_secondary_email',
  'would_you_like_to_sync',
  'web_channel_example',
];

// The array is converted into a RegExp
const PAIRING_ROUTES = [
  'pair/auth/allow',
  'pair/auth/complete',
  'pair/auth/totp',
  'pair/auth/wait_for_supp',
  'pair/supp/allow',
  'pair/supp/wait_for_auth',
];

const OAUTH_SUCCESS_ROUTES = ['/oauth/success/:clientId'];

const TERMS_PRIVACY_REGEX =
  /^\/(?:([a-zA-Z-\_]*)\/)?legal\/(terms|privacy)(?:\/)?$/;

module.exports = {
  FRONTEND_ROUTES,
  PAIRING_ROUTES,
  OAUTH_SUCCESS_ROUTES,
  TERMS_PRIVACY_REGEX,
};
