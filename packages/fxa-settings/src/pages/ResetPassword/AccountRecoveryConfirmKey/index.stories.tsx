/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createHistory, createMemorySource, History } from '@reach/router';
import React from 'react';
import { Account } from '../../../models';
import AccountRecoveryConfirmKey from '.';
import { Meta } from '@storybook/react';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { Subject } from './mocks';

export default {
  title: 'Pages/ResetPassword/AccountRecoveryConfirmKey',
  component: AccountRecoveryConfirmKey,
} as Meta;

const source = createMemorySource('/fake-memories');

const storyWithAccountAndHistory = (
  account: Account,
  history: History,
  storyName?: string
) => {
  const story = () => <Subject {...{ account, history }} />;
  story.storyName = storyName;
  return story;
};

const historyWithParams = createHistory(source);
historyWithParams.location.href =
  'http://localhost.com/?&token=token&code=code&email=email@email&uid=uid';

const historyWithoutParams = createHistory(source);
historyWithoutParams.location.href = 'http://localhost.com/?';

const accountValid = {
  getRecoveryKeyBundle: () => Promise.resolve(true),
  verifyPasswordForgotToken: () => Promise.resolve(false),
} as unknown as Account;

const accountWithTokenError = {
  verifyPasswordForgotToken: () => {
    throw AuthUiErrors.INVALID_TOKEN;
  },
} as unknown as Account;

const accountWithInvalidRecoveryKey = {
  getRecoveryKeyBundle: () => {
    throw Error('boop');
  },
} as unknown as Account;

export const OnConfirmValidKey = storyWithAccountAndHistory(
  accountValid,
  historyWithParams,
  'Valid recovery key. Users will be redirected to AccountRecoveryResetPassword on confirm'
);

export const OnConfirmInvalidKey = storyWithAccountAndHistory(
  accountWithInvalidRecoveryKey,
  historyWithParams
);

export const OnConfirmLinkExpired = storyWithAccountAndHistory(
  accountWithTokenError,
  historyWithParams
);

export const WithDamagedLink = storyWithAccountAndHistory(
  accountValid,
  historyWithoutParams
);
