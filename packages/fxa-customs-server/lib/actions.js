/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Actions that, if allowed, would allow an attacker
// to try a candidtate password against an account.
const PASSWORD_CHECKING_ACTION = {
  accountLogin: true,
  accountDestroy: true,
  passwordChange: true,
};

// Actions that, if allowed, would allow an attacker
// to try a guess at a randomly-generated security code.
// Code are higher entropy so we can allow more of these,
// but if you're doing it a lot, you're probably a baddie.
const CODE_VERIFYING_ACTION = {
  recoveryEmailVerifyCode: true,
  passwordForgotVerifyCode: true,
  verifyRecoveryCode: true,
};

// Actions that, if allowed, would allow an attacker
// to check whether an account exists or has certain
// properties for a particular user.
// Basically any unauthenticated endpoint that takes
// an email address as input.
const ACCOUNT_STATUS_ACTION = {
  accountCreate: true,
  accountLogin: true,
  accountDestroy: true,
  passwordChange: true,
  passwordForgotSendCode: true,
  accountStatusCheck: true,
  sendUnblockCode: true,
  recoveryKeyExists: true,
};

// Actions that send an email, and hence might make
// us look like spammers if abused.
const EMAIL_SENDING_ACTION = {
  accountCreate: true,
  createEmail: true,
  recoveryEmailResendCode: true,
  passwordForgotSendCode: true,
  passwordForgotResendCode: true,
  sendUnblockCode: true,
};

// Actions that can send sms, and could make us
// very annoying to a user if abused.
const SMS_SENDING_ACTION = {
  connectDeviceSms: true,
};

// Actions that may grant access to an account but
// are not associated with an email address or uid.
const ACCOUNT_ACCESS_ACTION = new Set(['consumeSigninCode']);

module.exports = {
  isPasswordCheckingAction: function(action) {
    return PASSWORD_CHECKING_ACTION[action];
  },

  isCodeVerifyingAction: function(action) {
    return CODE_VERIFYING_ACTION[action];
  },

  isAccountStatusAction: function(action) {
    return ACCOUNT_STATUS_ACTION[action];
  },

  isEmailSendingAction: function(action) {
    return EMAIL_SENDING_ACTION[action];
  },

  isSmsSendingAction: function(action) {
    return SMS_SENDING_ACTION[action];
  },

  isAccountAccessAction(action) {
    return ACCOUNT_ACCESS_ACTION.has(action);
  },
};
