/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MemoryRouter } from 'react-router';
import FlowRecoveryKeyHint from '.';
import { Meta } from '@storybook/react';
import AuthClient from 'fxa-auth-client/browser';
import { Account, AppContext } from '../../../models';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { mockAppContext, MOCK_ACCOUNT } from '../../../models/mocks';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';

export default {
  title: 'Components/Settings/FlowRecoveryKeyHint',
  component: FlowRecoveryKeyHint,
  decorators: [withLocalization],
} as Meta;

const localizedPageTitle = 'Account Recovery Key';
const localizedBackButtonTitle = 'Back to settings';
const viewName = 'settings.account-recovery';

const authClientWithHintResult = (updateRecoveryKeyHint: () => Promise<{}>) =>
  ({ updateRecoveryKeyHint }) as unknown as AuthClient;

const storyWithContext = (authClient: AuthClient) => {
  const story = () => (
    <MemoryRouter>
      <AppContext.Provider
        value={mockAppContext({
          account: MOCK_ACCOUNT as unknown as Account,
          authClient,
        })}
      >
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
    </MemoryRouter>
  );
  return story;
};

export const Default = storyWithContext(
  authClientWithHintResult(() => Promise.resolve({}))
);

export const WithUnexpectedError = storyWithContext(
  authClientWithHintResult(() => Promise.reject(AuthUiErrors.UNEXPECTED_ERROR))
);

export const WithUnknownError = storyWithContext(
  authClientWithHintResult(() => Promise.reject(new Error('Uh oh')))
);
