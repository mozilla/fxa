/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import PageRecoveryKeyCreate from '.';
import { Account, AppContext } from '../../../models';
import { mockAppContext, MOCK_ACCOUNT } from '../../../models/mocks';
import { LocationProvider } from '@reach/router';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';

export default {
  title: 'Pages/Settings/RecoveryKeyCreate',
  component: PageRecoveryKeyCreate,
  decorators: [withLocalization],
} as Meta;

const recoveryKeyRaw = new Uint8Array(20);

const accountWithSuccess = {
  ...MOCK_ACCOUNT,
  recoveryKey: { exists: false },
  createRecoveryKey: () => recoveryKeyRaw,
} as unknown as Account;

const accountWithPasswordError = {
  ...MOCK_ACCOUNT,
  createRecoveryKey: () => {
    throw AuthUiErrors.INCORRECT_PASSWORD;
  },
} as unknown as Account;

const accountWithThrottledError = {
  ...MOCK_ACCOUNT,
  createRecoveryKey: () => {
    throw AuthUiErrors.THROTTLED;
  },
} as unknown as Account;

const accountWithUnexpectedError = {
  ...MOCK_ACCOUNT,
  createRecoveryKey: () => {
    throw AuthUiErrors.UNEXPECTED_ERROR;
  },
} as unknown as Account;

const accountWithKeyEnabled = {
  ...MOCK_ACCOUNT,
  recoveryKey: { exists: true },
  createRecoveryKey: () => recoveryKeyRaw,
  deleteRecoveryKey: () => true,
} as unknown as Account;

const storyWithContext = (account: Account) => {
  const story = () => (
    <LocationProvider>
      <AppContext.Provider value={mockAppContext({ account })}>
        <PageRecoveryKeyCreate />
      </AppContext.Provider>
    </LocationProvider>
  );
  return story;
};

export const CreateKeyWithSuccess = storyWithContext(accountWithSuccess);

export const WithPasswordError = storyWithContext(accountWithPasswordError);

export const WithThrottledError = storyWithContext(accountWithThrottledError);

export const WithUnexpectedError = storyWithContext(accountWithUnexpectedError);

export const ChangeKeyWithSuccess = storyWithContext(accountWithKeyEnabled);
