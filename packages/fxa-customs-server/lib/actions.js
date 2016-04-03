/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var PASSWORD_CHECKING_ACTION = {
  accountLogin: true,
  accountDestroy: true,
  passwordChange: true,
}

var ACCOUNT_STATUS_ACTION = {
  accountStatusCheck: true
}

var EMAIL_SENDING_ACTION = {
  accountCreate: true,
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
