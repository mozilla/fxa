/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// TODO: share these with auth-server authMethods.js?
enum AuthenticationMethods {
  PWD = 'pwd',
  EMAIL = 'email',
  // TOTP / 2FA token
  OTP = 'otp',
}

export default AuthenticationMethods;
