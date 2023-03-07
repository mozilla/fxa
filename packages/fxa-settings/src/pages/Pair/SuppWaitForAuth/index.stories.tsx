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
import { MOCK_BANNER_MESSAGE } from './mocks';
import { withLocalization } from '../../../../.storybook/decorators';

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
    bannerMessage={MOCK_BANNER_MESSAGE}
  />
);
