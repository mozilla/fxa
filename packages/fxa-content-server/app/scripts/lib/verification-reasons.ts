/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * List of reasons a user must perform some form of verification.
 */

enum VerificationReasons {
  FORCE_AUTH = 'force_auth',
  PASSWORD_RESET = 'reset_password',
  PASSWORD_RESET_WITH_RECOVERY_KEY = 'reset_password_with_recovery_key',
  PRIMARY_EMAIL_VERIFIED = 'primary_email_verified',
  RECOVERY_KEY = 'recovery_key',
  SECONDARY_EMAIL_VERIFIED = 'secondary_email_verified',
  SIGN_IN = 'login',
  SIGN_UP = 'signup',
  SUCCESSFUL_OAUTH = 'oauth_success',
}

export default VerificationReasons;
