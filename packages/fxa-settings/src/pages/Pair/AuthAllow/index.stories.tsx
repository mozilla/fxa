/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AuthAllow from '.';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import {
  MOCK_METADATA_UNKNOWN_LOCATION,
  MOCK_METADATA_WITH_DEVICE_NAME,
  MOCK_METADATA_WITH_LOCATION,
} from '../../../components/DeviceInfoBlock/mocks';
import { MOCK_ACCOUNT, mockAppContext } from '../../../models/mocks';
import { AppContext } from '../../../models/contexts/AppContext';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Pages/Pair/AuthAllow',
  component: AuthAllow,
  decorators: [
    withLocalization,
    (Story) => (
      <AppContext.Provider value={mockAppContext()}>
        <LocationProvider>
          <Story />
        </LocationProvider>
      </AppContext.Provider>
    ),
  ],
} as Meta;

export const WithLocation = () => (
  <AuthAllow
    email={MOCK_ACCOUNT.primaryEmail.email}
    suppDeviceInfo={MOCK_METADATA_WITH_LOCATION}
  />
);

export const WithUnknownLocation = () => (
  <AuthAllow
    email={MOCK_ACCOUNT.primaryEmail.email}
    suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
  />
);

export const WithDeviceName = () => (
  <AuthAllow
    email={MOCK_ACCOUNT.primaryEmail.email}
    suppDeviceInfo={MOCK_METADATA_WITH_DEVICE_NAME}
  />
);

export const WithoutDeviceInfo = () => (
  <AuthAllow email={MOCK_ACCOUNT.primaryEmail.email} />
);

export const WithError = () => (
  <AuthAllow
    email={MOCK_ACCOUNT.primaryEmail.email}
    suppDeviceInfo={MOCK_METADATA_WITH_DEVICE_NAME}
    error="An error occurred during pairing"
  />
);
