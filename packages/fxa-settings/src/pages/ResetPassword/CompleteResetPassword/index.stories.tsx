/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import CompleteResetPassword from '.';
import { Account } from '../../../models';
import { withLocalization } from '../../../../.storybook/decorators';
import { paramsWithMissingEmail, Subject } from './mocks';

export default {
  title: 'Pages/ResetPassword/CompleteResetPassword',
  component: CompleteResetPassword,
  decorators: [withLocalization],
} as Meta;

const storyWithSubject = (
  account: Account,
  params?: Record<string, string>,
  storyName?: string
) => {
  const story = () => {
    return <Subject {...{ account, params }} />;
  };

  story.storyName = storyName;
  return story;
};

const accountNoRecoveryKey = {
  resetPasswordStatus: () => Promise.resolve(true),
  hasRecoveryKey: () => Promise.resolve(false),
} as unknown as Account;

const accountWithRecoveryKeyStatusError = {
  resetPasswordStatus: () => Promise.resolve(true),
  hasRecoveryKey: () => {
    throw new Error('boop');
  },
} as unknown as Account;

const accountWithFalseyResetPasswordStatus = {
  resetPasswordStatus: () => Promise.resolve(false),
} as unknown as Account;

export const NoRecoveryKeySet = storyWithSubject(
  accountNoRecoveryKey,
  undefined,
  'Default - no account recovery key set. Users with one set will be redirected to AccountRecoveryConfirmKey'
);

export const ErrorCheckingRecoveryKeyStatus = storyWithSubject(
  accountWithRecoveryKeyStatusError
);

export const WithExpiredLink = storyWithSubject(
  accountWithFalseyResetPasswordStatus
);

export const WithDamagedLink = storyWithSubject(
  accountNoRecoveryKey,
  paramsWithMissingEmail
);
