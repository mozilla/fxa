/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * List of methods by which a user can verify.
 * A user can currently only verify via email.
 * In the future SMS and TOTP could also be included.
 */

enum VerificationMethods {
  EMAIL = 'email',
  EMAIL_2FA = 'email-2fa',
  EMAIL_CAPTCHA = 'email-captcha',
  EMAIL_OTP = 'email-otp',
  TOTP_2FA = 'totp-2fa',
}

export default VerificationMethods;
