/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const error = require('../error');

module.exports = (log, config) => {
  config = config || {};
  const lifetimes = (config.tokenLifetimes = config.tokenLifetimes || {
    accountResetToken: 1000 * 60 * 15,
    passwordChangeToken: 1000 * 60 * 15,
    passwordForgotToken: 1000 * 60 * 15,
  });
  const Bundle = require('./bundle');
  const Token = require('./token')(log, config);

  const KeyFetchToken = require('./key_fetch_token')(log, Token);
  const AccountResetToken = require('./account_reset_token')(
    log,
    Token,
    lifetimes.accountResetToken
  );
  const SessionToken = require('./session_token')(log, Token, config);
  const PasswordForgotToken = require('./password_forgot_token')(
    log,
    Token,
    lifetimes.passwordForgotToken
  );

  const PasswordChangeToken = require('./password_change_token')(
    log,
    Token,
    lifetimes.passwordChangeToken
  );

  Token.error = error;
  Token.Bundle = Bundle;
  Token.AccountResetToken = AccountResetToken;
  Token.KeyFetchToken = KeyFetchToken;
  Token.SessionToken = SessionToken;
  Token.PasswordForgotToken = PasswordForgotToken;
  Token.PasswordChangeToken = PasswordChangeToken;

  return Token;
};
