/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import AuthWaitForSupp from '.';
import {
  MOCK_METADATA_UNKNOWN_LOCATION,
  MOCK_METADATA_WITH_DEVICE_NAME,
  MOCK_METADATA_WITH_LOCATION,
} from '../../../components/DeviceInfoBlock/mocks';

export default {
  title: 'Pages/Pair/AuthWaitForSupp',
  component: AuthWaitForSupp,
  decorators: [withLocalization],
} as Meta;

export const WithLocation = () => (
  <AuthWaitForSupp suppDeviceInfo={MOCK_METADATA_WITH_LOCATION} />
);

export const WithUnknownLocation = () => (
  <AuthWaitForSupp suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION} />
);

export const WithDeviceName = () => (
  <AuthWaitForSupp suppDeviceInfo={MOCK_METADATA_WITH_DEVICE_NAME} />
);

export const WithErrorMessage = () => (
  <AuthWaitForSupp
    suppDeviceInfo={MOCK_METADATA_WITH_DEVICE_NAME}
    bannerType="error"
    localizedBannerMessage="This is an error message"
  />
);
