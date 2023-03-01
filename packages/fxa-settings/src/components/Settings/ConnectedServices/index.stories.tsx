/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from '../../../../.storybook/decorators';
import { LocationProvider } from '@reach/router';
import { ConnectedServices } from '.';

import { MOCK_SERVICES, MOCK_SERVICES_WITHOUT_MOBILE } from './mocks';
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

const storyWithContext = (account: Partial<Account>) => {
  const context = { account: account as Account };

  const story = () => (
    <LocationProvider>
      <AppContext.Provider value={mockAppContext(context)}>
        <ConnectedServices />
      </AppContext.Provider>
    </LocationProvider>
  );
  return story;
};

export const Default = storyWithContext(accountWithManyServices);

// Shows ConnectAnotherDevicePromo if no mobile devices in the list
export const NoMobileServices = storyWithContext(accountWithoutMobileDevice);

// TODO: Add story with advice modal for lost/suspicious devices
