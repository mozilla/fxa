/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import error from '../error';
import Bundle from './bundle';
import TokenModule from './token';
import KeyFetchTokenModule from './key_fetch_token';
import AccountResetTokenModule from './account_reset_token';
import SessionTokenModule from './session_token';
import PasswordForgotTokenModule from './password_forgot_token';
import PasswordChangeTokenModule from './password_change_token';

export default (log, config) => {
  config = config || {};
  const lifetimes = (config.tokenLifetimes = config.tokenLifetimes || {
    accountResetToken: 1000 * 60 * 15,
    passwordChangeToken: 1000 * 60 * 15,
    passwordForgotToken: 1000 * 60 * 15,
  });

  const Token = TokenModule(log, config);

  const KeyFetchToken = KeyFetchTokenModule(log, Token);
  const AccountResetToken = AccountResetTokenModule(
    log,
    Token,
    lifetimes.accountResetToken
  );
  const SessionToken = SessionTokenModule(log, Token, config);
  const PasswordForgotToken = PasswordForgotTokenModule(
    log,
    Token,
    lifetimes.passwordForgotToken
  );

  const PasswordChangeToken = PasswordChangeTokenModule(
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
