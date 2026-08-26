/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { ConnectThisDevice } from '.';
import {
  MOCK_METADATA_UNKNOWN_LOCATION,
  MOCK_METADATA_WITH_LOCATION,
} from '../../../../components/DeviceInfoBlock/mocks';
import {
  MOCK_LONG_EMAIL,
  MOCK_METADATA_LONG_DEVICE_NAME,
  Subject,
} from './mocks';

export default {
  title: 'Pages/Pair2/Supplicant/ConnectThisDevice',
  component: ConnectThisDevice,
  decorators: [withLocalization],
} as Meta;

export const WithDeviceName = () => <Subject />;

// No device name on the pairing payload, so the device line falls back to the OS.
export const WithoutDeviceName = () => (
  <Subject remoteMetadata={MOCK_METADATA_WITH_LOCATION} />
);

// Geo lookup resolved nothing, so the location line reads "Location unknown".
export const WithUnknownLocation = () => (
  <Subject remoteMetadata={MOCK_METADATA_UNKNOWN_LOCATION} />
);

export const WithLongDeviceName = () => (
  <Subject remoteMetadata={MOCK_METADATA_LONG_DEVICE_NAME} />
);

export const WithLongEmail = () => <Subject email={MOCK_LONG_EMAIL} />;
