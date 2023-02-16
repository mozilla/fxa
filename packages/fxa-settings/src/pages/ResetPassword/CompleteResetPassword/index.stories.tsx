/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import {
  createHistory,
  createMemorySource,
  History,
  LocationProvider,
} from '@reach/router';
import { Meta } from '@storybook/react';
import CompleteResetPassword from '.';
import { mockAppContext } from '../../../models/mocks';
import { AppContext, Account } from '../../../models';
import { withLocalization } from '../../../../.storybook/decorators';

export default {
  title: 'Pages/ResetPassword/CompleteResetPassword',
  component: CompleteResetPassword,
  decorators: [withLocalization],
} as Meta;

const source = createMemorySource('/fake-memories');

const storyWithAccountAndHistory = (
  account: Account,
  history: History,
  storyName?: string
) => {
  const story = () => (
    <AppContext.Provider value={mockAppContext({ account })}>
      <LocationProvider history={history}>
        <CompleteResetPassword />
      </LocationProvider>
    </AppContext.Provider>
  );
  story.storyName = storyName;
  return story;
};

const historyWithParams = createHistory(source);
historyWithParams.location.href = `${window.location.href}?&token=token&code=code&email=email@email&emailToHashWith=emailToHashWith`;

const historyWithoutParams = createHistory(source);
historyWithoutParams.location.href = 'http://localhost.com/?';

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

export const NoRecoveryKeySet = storyWithAccountAndHistory(
  accountNoRecoveryKey,
  historyWithParams,
  'Default - no account recovery key set. Users with one set will be redirected to AccountRecoveryConfirmKey'
);

export const ErrorCheckingRecoveryKeyStatus = storyWithAccountAndHistory(
  accountWithRecoveryKeyStatusError,
  historyWithParams
);

export const WithExpiredLink = storyWithAccountAndHistory(
  accountWithFalseyResetPasswordStatus,
  historyWithParams
);

export const WithDamagedLink = storyWithAccountAndHistory(
  accountNoRecoveryKey,
  historyWithoutParams
);
