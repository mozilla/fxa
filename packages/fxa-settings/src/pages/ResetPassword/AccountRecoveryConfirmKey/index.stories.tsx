/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Account } from '../../../models';
import AccountRecoveryConfirmKey from '.';
import { Meta } from '@storybook/react';
import {
  getSubject,
  mockCompleteResetPasswordParams,
  paramsWithMissingEmail,
} from './mocks';
import { produceComponent } from '../../../models/mocks';

export default {
  title: 'Pages/ResetPassword/AccountRecoveryConfirmKey',
  component: AccountRecoveryConfirmKey,
} as Meta;

function renderStory(
  { account = accountValid, params = mockCompleteResetPasswordParams } = {},
  storyName?: string
) {
  const { Subject, history, appCtx } = getSubject(account, params);
  const story = () => produceComponent(<Subject />, { history }, appCtx);
  story.storyName = storyName;
  return story();
}

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

export const OnConfirmValidKey = () => {
  return renderStory(
    {},
    'Valid recovery key (32 characters). Users will be redirected to AccountRecoveryResetPassword on confirm'
  );
};

export const OnConfirmInvalidKey = () => {
  return renderStory({
    account: accountWithInvalidRecoveryKey,
    params: mockCompleteResetPasswordParams,
  });
};

export const OnConfirmLinkExpired = () => {
  return renderStory({
    account: accountWithExpiredLink,
    params: mockCompleteResetPasswordParams,
  });
};

export const WithDamagedLink = () => {
  return renderStory({
    params: paramsWithMissingEmail,
  });
};
