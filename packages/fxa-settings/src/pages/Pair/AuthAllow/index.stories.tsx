/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AuthAllow from '.';
import { Meta } from '@storybook/react';
import {
  MOCK_METADATA_UNKNOWN_LOCATION,
  MOCK_METADATA_WITH_DEVICE_NAME,
  MOCK_METADATA_WITH_LOCATION,
} from '../../../components/DeviceInfoBlock/mocks';
import { MOCK_ACCOUNT } from '../../../models/mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Pages/Pair/AuthAllow',
  component: AuthAllow,
  decorators: [withLocalization],
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

export const WithErrorMessage = () => (
  <AuthAllow
    email={MOCK_ACCOUNT.primaryEmail.email}
    suppDeviceInfo={MOCK_METADATA_WITH_DEVICE_NAME}
    bannerType="error"
    localizedBannerMessage="This is an error message"
  />
);
