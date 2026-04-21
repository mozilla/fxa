/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { PageDeleteAccount } from '.';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import SettingsLayout from '../SettingsLayout';
import { Account, AppContext } from '../../../models';
import { mockAppContext, MOCK_ACCOUNT } from '../../../models/mocks';

export default {
  title: 'Pages/Settings/DeleteAccount',
  component: PageDeleteAccount,
  decorators: [withLocalization],
} as Meta;

const accountWithPassword = {
  ...MOCK_ACCOUNT,
  hasPassword: true,
  destroy: () => Promise.resolve(),
} as unknown as Account;

const accountWithoutPassword = {
  ...MOCK_ACCOUNT,
  hasPassword: false,
  destroy: () => Promise.resolve(),
} as unknown as Account;

const storyWithContext = (account: Account) => {
  const story = () => (
    <LocationProvider>
      <AppContext.Provider value={mockAppContext({ account })}>
        <SettingsLayout>
          <PageDeleteAccount />
        </SettingsLayout>
      </AppContext.Provider>
    </LocationProvider>
  );
  return story;
};

export const Default = storyWithContext(accountWithPassword);

export const WithoutPassword = storyWithContext(accountWithoutPassword);
