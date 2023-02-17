/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import DeviceInfoBlock from '.';
import { RemoteMetadata } from '../../lib/types';
import AppLayout from '../AppLayout';
import { Meta } from '@storybook/react';
import {
  MOCK_METADATA_UNKNOWN_LOCATION,
  MOCK_DEVICE_NAME,
  MOCK_CITY,
  MOCK_REGION,
  MOCK_COUNTRY,
} from './mocks';
import { withLocalization } from '../../../.storybook/decorators';

export default {
  title: 'Components/DeviceInfoBlock',
  component: DeviceInfoBlock,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = (props?: Partial<RemoteMetadata>) => {
  const story = () => (
    <AppLayout>
      <DeviceInfoBlock
        remoteMetadata={MOCK_METADATA_UNKNOWN_LOCATION}
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
