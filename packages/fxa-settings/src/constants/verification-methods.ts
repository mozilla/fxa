/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

enum VerificationMethods {
  // Verification by email link
  EMAIL = 'email',
  EMAIL_2FA = 'email-2fa',
  // Verification by email code using randomly generated code (used in unblock flow)
  EMAIL_CAPTCHA = 'email-captcha',
  EMAIL_OTP = 'email-otp',
  TOTP_2FA = 'totp-2fa',
}

export default VerificationMethods;
