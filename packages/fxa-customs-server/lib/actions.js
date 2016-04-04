/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Actions that, if allowed, would allow an attacker
// to try a candidtate password against an account.
var PASSWORD_CHECKING_ACTION = {
  accountLogin: true,
  accountDestroy: true,
  passwordChange: true,
}

// Actions that, if allowed, would allow an attacker
// to check whether an account exists for a particular user.
// Basically any unauthenticated endpoint that takes
// an email address as input.
var ACCOUNT_STATUS_ACTION = {
  accountCreate: true,
  accountLogin: true,
  accountDestroy: true,
  accountLock: true,
  accountUnlockResendCode: true,
  passwordChange: true,
  passwordForgotSendCode: true,
  accountStatusCheck: true
}

// Actions that send an email, and hence might make
// us look like spammers if abused.
var EMAIL_SENDING_ACTION = {
  accountCreate: true,
  accountUnlockResendCode: true,
  recoveryEmailResendCode: true,
  passwordForgotSendCode: true,
  passwordForgotResendCode: true
}

module.exports = {

  isPasswordCheckingAction: function isPasswordCheckingAction(action) {
    return PASSWORD_CHECKING_ACTION[action]
  },

  isAccountStatusAction: function isAccountStatusAction(action) {
    return ACCOUNT_STATUS_ACTION[action]
  },

  isEmailSendingAction: function isEmailSendingAction(action) {
    return EMAIL_SENDING_ACTION[action]
  }

}
