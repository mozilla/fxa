/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Indicators to the back-end that the sign-in is to complete some
// action. The back-end may perform an action based on the reason,
// e.g. send an email.

export default {
  PASSWORD_CHANGE: 'password_change',
  PASSWORD_CHECK: 'password_check',
  PASSWORD_RESET: 'password_reset',
  SIGN_IN: 'signin',
};
