/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Actions that, if allowed, would allow an attacker
// to try a candidtate password against an account.
var PASSWORD_CHECKING_ACTION = {
  accountLogin: true,
  accountDestroy: true,
  passwordChange: true
}

// Actions that, if allowed, would allow an attacker
// to try a guess at a randomly-generated security code.
// Code are higher entropy so we can allow more of these,
// but if you're doing it a lot, you're probably a baddie.
var CODE_VERIFYING_ACTION = {
  recoveryEmailVerifyCode: true,
  passwordForgotVerifyCode: true
}

// Actions that, if allowed, would allow an attacker
// to check whether an account exists for a particular user.
// Basically any unauthenticated endpoint that takes
// an email address as input.
var ACCOUNT_STATUS_ACTION = {
  accountCreate: true,
  accountLogin: true,
  accountDestroy: true,
  passwordChange: true,
  passwordForgotSendCode: true,
  accountStatusCheck: true,
  sendUnblockCode: true
}

// Actions that send an email, and hence might make
// us look like spammers if abused.
var EMAIL_SENDING_ACTION = {
  accountCreate: true,
  recoveryEmailResendCode: true,
  passwordForgotSendCode: true,
  passwordForgotResendCode: true,
  sendUnblockCode: true
}

module.exports = {

  isPasswordCheckingAction: function isPasswordCheckingAction(action) {
    return PASSWORD_CHECKING_ACTION[action]
  },

  isCodeVerifyingAction: function isCodeVerifyingAction(action) {
    return CODE_VERIFYING_ACTION[action]
  },

  isAccountStatusAction: function isAccountStatusAction(action) {
    return ACCOUNT_STATUS_ACTION[action]
  },

  isEmailSendingAction: function isEmailSendingAction(action) {
    return EMAIL_SENDING_ACTION[action]
  }

}
