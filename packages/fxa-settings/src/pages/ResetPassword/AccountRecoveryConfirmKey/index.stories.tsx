/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Account } from '../../../models';
import AccountRecoveryConfirmKey from '.';
import { Meta } from '@storybook/react';
import {
  mockCompleteResetPasswordParams,
  paramsWithMissingEmail,
  Subject,
} from './mocks';

export default {
  title: 'Pages/ResetPassword/AccountRecoveryConfirmKey',
  component: AccountRecoveryConfirmKey,
} as Meta;

const storyWithSubject = (
  account: Account,
  params: Record<string, string>,
  storyName?: string
) => {
  const story = () => <Subject {...{ account, params }} />;
  story.storyName = storyName;
  return story;
};

const accountValid = {
  resetPasswordStatus: () => Promise.resolve(true),
  getRecoveryKeyBundle: () => Promise.resolve(true),
  verifyPasswordForgotToken: () => Promise.resolve(false),
} as unknown as Account;

const accountWithExpiredLink = {
  resetPasswordStatus: () => Promise.resolve(false),
} as unknown as Account;

const accountWithInvalidRecoveryKey = {
  resetPasswordStatus: () => Promise.resolve(true),
  getRecoveryKeyBundle: () => {
    throw Error('boop');
  },
  verifyPasswordForgotToken: () => Promise.resolve(true),
} as unknown as Account;

export const OnConfirmValidKey = storyWithSubject(
  accountValid,
  mockCompleteResetPasswordParams,
  'Valid recovery key. Users will be redirected to AccountRecoveryResetPassword on confirm'
);

export const OnConfirmInvalidKey = storyWithSubject(
  accountWithInvalidRecoveryKey,
  mockCompleteResetPasswordParams
);

export const OnConfirmLinkExpired = storyWithSubject(
  accountWithExpiredLink,
  mockCompleteResetPasswordParams
);

export const WithDamagedLink = storyWithSubject(
  accountValid,
  paramsWithMissingEmail
);
