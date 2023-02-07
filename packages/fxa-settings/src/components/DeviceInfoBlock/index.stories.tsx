/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import DeviceInfoBlock from '.';
import { RemoteMetadata } from '../../lib/types';
import AppLayout from '../AppLayout';
import { Meta } from '@storybook/react';
import {
  MOCK_BROWSER_NAME,
  MOCK_IP_ADDRESS,
  MOCK_OS_NAME,
  MOCK_DEVICE_NAME,
  MOCK_CITY,
  MOCK_REGION,
  MOCK_COUNTRY,
} from './mocks';

export default {
  title: 'components/DeviceInfoBlock',
  component: DeviceInfoBlock,
} as Meta;

const storyWithProps = (props?: Partial<RemoteMetadata>) => {
  const story = () => (
    <AppLayout>
      <DeviceInfoBlock
        ipAddress={MOCK_IP_ADDRESS}
        browserName={MOCK_BROWSER_NAME}
        genericOSName={MOCK_OS_NAME}
        {...props}
      />
    </AppLayout>
  );
  return story;
};

export const WithUnknownLocation = storyWithProps();

export const WithDeviceName = storyWithProps({ deviceName: MOCK_DEVICE_NAME });

export const WithRegionAndCountry = storyWithProps({
  region: MOCK_REGION,
  country: MOCK_COUNTRY,
});

export const WithCityAndCountry = storyWithProps({
  city: MOCK_CITY,
  country: MOCK_COUNTRY,
});

export const WithCountryOnly = storyWithProps({
  country: MOCK_COUNTRY,
});

export const WithFullLocation = storyWithProps({
  city: MOCK_CITY,
  region: MOCK_REGION,
  country: MOCK_COUNTRY,
});
