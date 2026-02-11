/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { LinkedAccounts } from '.';
import { MOCK_LINKED_ACCOUNTS } from './mocks';
import { AppContext } from 'fxa-settings/src/models';
import { mockAppContext } from 'fxa-settings/src/models/mocks';
import { LocationProvider } from '@reach/router';

export default {
  title: 'Components/Settings/LinkedAccounts',
  component: LinkedAccounts,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <LocationProvider>
    <AppContext.Provider
      value={mockAppContext({
        account: { linkedAccounts: MOCK_LINKED_ACCOUNTS } as any,
      })}
    >
      <LinkedAccounts />
    </AppContext.Provider>
  </LocationProvider>
);

export const NoPassword = () => {
  <LocationProvider>
    <AppContext.Provider
      value={mockAppContext({
        account: {
          hasPassword: false,
          linkedAccounts: MOCK_LINKED_ACCOUNTS,
        } as any,
      })}
    >
      <LinkedAccounts />
    </AppContext.Provider>
  </LocationProvider>;
};
