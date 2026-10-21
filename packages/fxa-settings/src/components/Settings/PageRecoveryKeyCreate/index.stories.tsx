/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { PageRecoveryKeyCreate } from '.';
import { Account, AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';
import { MemoryRouter } from 'react-router';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import AuthClient from 'fxa-auth-client/browser';
import {
  mockAccountWithoutRecoveryKey as accountWithoutKey,
  mockAccountWithRecoveryKey as accountWithKey,
  mockRecoveryKeyAuthClient,
} from '../FlowRecoveryKeyConfirmPwd/mocks';

export default {
  title: 'Pages/Settings/RecoveryKeyCreate',
  component: PageRecoveryKeyCreate,
  decorators: [withLocalization],
} as Meta;

const storyWithContext = (account: Account, authClient: AuthClient) => {
  const story = () => (
    <MemoryRouter>
      <AppContext.Provider value={mockAppContext({ account, authClient })}>
        <PageRecoveryKeyCreate />
      </AppContext.Provider>
    </MemoryRouter>
  );
  return story;
};

export const CreateKeyWithSuccess = storyWithContext(
  accountWithoutKey,
  mockRecoveryKeyAuthClient()
);

export const WithPasswordError = storyWithContext(
  accountWithoutKey,
  mockRecoveryKeyAuthClient(AuthUiErrors.INCORRECT_PASSWORD)
);

export const WithThrottledError = storyWithContext(
  accountWithoutKey,
  mockRecoveryKeyAuthClient(AuthUiErrors.THROTTLED)
);

export const WithUnexpectedError = storyWithContext(
  accountWithoutKey,
  mockRecoveryKeyAuthClient(AuthUiErrors.UNEXPECTED_ERROR)
);

export const ChangeKeyWithSuccess = storyWithContext(
  accountWithKey,
  mockRecoveryKeyAuthClient()
);
