/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Storage from './storage';

const ORIGINAL_TAB_KEY = 'originalTab';

function sessionStorage() {
  return Storage.factory('sessionStorage');
}

export function isOriginalTab() {
  const storage = sessionStorage();
  let value = storage.get(ORIGINAL_TAB_KEY);

  // Fallback for content server's applied state.
  if (value === undefined) {
    value = window.sessionStorage.getItem(ORIGINAL_TAB_KEY);
  }

  return value;
}

export function clearOriginalTab() {
  const storage = sessionStorage();
  return storage.remove(ORIGINAL_TAB_KEY);
}

export function setOriginalTabMarker() {
  const storage = sessionStorage();
  storage.set(ORIGINAL_TAB_KEY, '1');
}

const OAUTH_KEY = 'oauth';
export function clearOAuthData() {
  const storage = sessionStorage();
  storage.remove(OAUTH_KEY);
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
