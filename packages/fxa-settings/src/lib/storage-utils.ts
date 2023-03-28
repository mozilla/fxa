/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Storage from './storage';

export function isOriginalTab() {
  const storage = Storage.factory('sessionStorage');
  return storage.get('originalTab');
}

/* TODO. This runs in choose_what_to_sync, confirm_reset_password, confirm_signup_code,
confirm, sign_in_token_code, and push/send_login if non-OAuth integration type. */
export function persistVerificationData() {
  // verification info is persisted to localStorage so that the same `context` / integration
  // is used if the user verifies in the same browser. If the user verifies in a different
  // browser, the default (direct access) integration will be used.
  /* (reference content-server base auth_broker) */
}

/* TODO. This runs in choose_what_to_sync, confirm_reset_password, confirm_signup_code,
confirm, sign_in_token_code, and push/send_login if OAuth integration type. */
export function persistOAuthVerificationData() {
  // If the user replaces the current tab with the verification url,
  // finish the OAuth flow.
  /* (reference content-server oauth auth_broker, this sets `originalTab`) */
}

/* TODO. This runs in these auth-broker methods:
 * afterCompleteSignIn, afterCompleteAddPostVerifyRecovery, afterAbortAddPostVerifyRecovery,
 * afterCompletePrimaryEmail, afterCompleteSecondaryEmail, afterSignUpConfirmationPoll,
 * afterCompleteSignUp, afterResetPasswordConfirmationPoll afterCompleteResetPassword */
export function unpersistVerificationData() {}
