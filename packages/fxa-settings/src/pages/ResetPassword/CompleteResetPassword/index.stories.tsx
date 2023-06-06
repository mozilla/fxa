/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import CompleteResetPassword from '.';
import { Account } from '../../../models';
import { withLocalization } from '../../../../.storybook/decorators';
import { getSubject, paramsWithMissingEmail } from './mocks';
import { produceComponent } from '../../../models/mocks';
// import { resetMocks } from '../AccountRecoveryResetPassword/mocks';

export default {
  title: 'Pages/ResetPassword/CompleteResetPassword',
  component: CompleteResetPassword,
  decorators: [withLocalization],
} as Meta;

type RenderStoryOptions = {
  account?: Account;
  params?: Record<string, string>;
};

function renderStory(
  { account = accountNoRecoveryKey, params }: RenderStoryOptions = {},
  storyName?: string
) {
  // resetMocks();
  const { Subject, history, appCtx } = getSubject(account, params);
  const story = () => produceComponent(<Subject />, { history }, appCtx);
  story.storyName = storyName;
  return story();
}

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

export const NoRecoveryKeySet = () => {
  return renderStory(
    {},
    'Default - no account recovery key set. Users with one set will be redirected to AccountRecoveryConfirmKey'
  );
};

export const ErrorCheckingRecoveryKeyStatus = () => {
  return renderStory({
    account: accountWithRecoveryKeyStatusError,
  });
};
export const WithExpiredLink = () => {
  return renderStory({
    account: accountWithFalseyResetPasswordStatus,
  });
};

export const WithDamagedLink = () => {
  return renderStory({
    account: accountNoRecoveryKey,
    params: paramsWithMissingEmail,
  });
};
