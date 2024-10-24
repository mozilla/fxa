/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import SuppWaitForAuth from '.';
import { Meta } from '@storybook/react';
import {
  MOCK_METADATA_UNKNOWN_LOCATION,
  MOCK_METADATA_WITH_DEVICE_NAME,
  MOCK_METADATA_WITH_LOCATION,
} from '../../../components/DeviceInfoBlock/mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Pages/Pair/SuppWaitForAuth',
  component: SuppWaitForAuth,
  decorators: [withLocalization],
} as Meta;

export const WithLocation = () => (
  <SuppWaitForAuth authDeviceInfo={MOCK_METADATA_WITH_LOCATION} />
);

export const WithUnknownLocation = () => (
  <SuppWaitForAuth authDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION} />
);

export const WithDeviceName = () => (
  <SuppWaitForAuth authDeviceInfo={MOCK_METADATA_WITH_DEVICE_NAME} />
);

export const WithErrorMessage = () => (
  <SuppWaitForAuth
    authDeviceInfo={MOCK_METADATA_WITH_DEVICE_NAME}
    bannerType="error"
    bannerMessage="There was an error"
  />
);
