/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import WaitForSupp from '.';
import { Meta } from '@storybook/react';
import {
  MOCK_METADATA_UNKNOWN_LOCATION,
  MOCK_METADATA_WITH_DEVICE_NAME,
  MOCK_METADATA_WITH_LOCATION,
} from '../../../../components/DeviceInfoBlock/mocks';
import { MOCK_BANNER_MESSAGE } from './mocks';

export default {
  title: 'pages/Pair/Auth/WaitForSupp',
  component: WaitForSupp,
} as Meta;

export const WithLocation = () => (
  <WaitForSupp suppDeviceInfo={MOCK_METADATA_WITH_LOCATION} />
);

export const WithUnknownLocation = () => (
  <WaitForSupp suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION} />
);

export const WithDeviceName = () => (
  <WaitForSupp suppDeviceInfo={MOCK_METADATA_WITH_DEVICE_NAME} />
);

export const WithErrorMessage = () => (
  <WaitForSupp
    suppDeviceInfo={MOCK_METADATA_WITH_DEVICE_NAME}
    bannerMessage={MOCK_BANNER_MESSAGE}
  />
);
