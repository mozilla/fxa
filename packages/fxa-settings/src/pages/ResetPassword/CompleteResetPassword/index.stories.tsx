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

export default {
  title: 'pages/ResetPassword/CompleteResetPassword',
  component: CompleteResetPassword,
} as Meta;

const source = createMemorySource('/fake-memories');

const storyWithAccountAndHistory = (account: Account, history: History) => {
  const story = () => (
    <AppContext.Provider value={mockAppContext({ account })}>
      <LocationProvider history={history}>
        <CompleteResetPassword />
      </LocationProvider>
    </AppContext.Provider>
  );
  return story;
};

const validHistory = createHistory(source);
validHistory.location.href =
  'http://localhost.com/?&token=token&code=code&email=email@email&emailToHashWith=emailToHashWith';

const invalidHistory = createHistory(source);
invalidHistory.location.href = 'http://localhost.com/?';

const validAccount = {
  resetPasswordStatus: () => Promise.resolve(true),
} as unknown as Account;

const invalidAccount = {
  resetPasswordStatus: () => Promise.resolve(false),
} as unknown as Account;

export const Default = storyWithAccountAndHistory(validAccount, validHistory);

export const WithExpiredLink = storyWithAccountAndHistory(
  invalidAccount,
  validHistory
);

export const WithDamagedLink = storyWithAccountAndHistory(
  validAccount,
  invalidHistory
);
