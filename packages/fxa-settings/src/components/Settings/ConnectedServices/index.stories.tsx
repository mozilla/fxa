/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { MemoryRouter } from 'react-router';
import { ConnectedServices } from '.';

import {
  MOCK_BROWSER_SERVICES,
  MOCK_SERVICES,
  MOCK_SERVICES_WITHOUT_MOBILE,
} from './mocks';
import { Account, AppContext } from 'fxa-settings/src/models';
import { mockAppContext } from 'fxa-settings/src/models/mocks';

export default {
  title: 'Components/Settings/ConnectedServices',
  component: ConnectedServices,
  decorators: [withLocalization],
} as Meta;

const accountWithManyServices = {
  attachedClients: MOCK_SERVICES,
} as unknown as Account;

const accountWithoutMobileDevice = {
  attachedClients: MOCK_SERVICES_WITHOUT_MOBILE,
} as unknown as Account;

const accountWithBrowserServices = {
  attachedClients: MOCK_BROWSER_SERVICES,
} as unknown as Account;

const storyWithContext = (account: Partial<Account>) => {
  const context = { account: account as Account };

  const story = () => (
    <MemoryRouter>
      <AppContext.Provider value={mockAppContext(context)}>
        <ConnectedServices />
      </AppContext.Provider>
    </MemoryRouter>
  );
  return story;
};

export const Default = storyWithContext(accountWithManyServices);

// Shows ConnectAnotherDevicePromo if no mobile devices in the list
export const NoMobileServices = storyWithContext(accountWithoutMobileDevice);

// Demonstrates the read-only scope sub-entries shown under a refresh-token
// browser entry when the token's scope includes Relay and/or VPN.
export const BrowserServices = storyWithContext(accountWithBrowserServices);

// TODO: Add story with advice modal for lost/suspicious devices
