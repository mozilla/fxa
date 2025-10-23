/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import FlowRecoveryKeyHint from '.';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { Account, AppContext } from '../../../models';
import { MOCK_ACCOUNT, mockAppContext } from '../../../models/mocks';

export default {
  title: 'Components/Settings/FlowRecoveryKeyHint',
  component: FlowRecoveryKeyHint,
  decorators: [withLocalization],
} as Meta;

const localizedPageTitle = 'Account Recovery Key';
const localizedBackButtonTitle = 'Back to settings';
const viewName = 'settings.account-recovery';

const accountWithSuccess = {
  ...MOCK_ACCOUNT,
  updateRecoveryKeyHint: () => {},
} as unknown as Account;

const accountWithUnexpectedError = {
  ...MOCK_ACCOUNT,
  updateRecoveryKeyHint: () => {
    throw AuthUiErrors.UNEXPECTED_ERROR;
  },
} as unknown as Account;

const accountWithUnknownError = {
  ...MOCK_ACCOUNT,
  updateRecoveryKeyHint: () => {
    throw new Error('Uh oh');
  },
} as unknown as Account;

const storyWithContext = (account: Account) => {
  const story = () => (
    <LocationProvider>
      <AppContext.Provider value={mockAppContext({ account })}>
        <FlowRecoveryKeyHint
          {...{ localizedBackButtonTitle, localizedPageTitle, viewName }}
          navigateBackward={() => {
            alert('navigating to previous page');
          }}
          navigateForward={() => {
            alert('navigating to next view within wizard');
          }}
        />
      </AppContext.Provider>
    </LocationProvider>
  );
  return story;
};

export const Default = storyWithContext(accountWithSuccess);

export const WithUnexpectedError = storyWithContext(accountWithUnexpectedError);

export const WithUnknownError = storyWithContext(accountWithUnknownError);
