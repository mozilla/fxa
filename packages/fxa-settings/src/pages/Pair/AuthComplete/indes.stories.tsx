/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import AuthComplete from '.';
import { MOCK_METADATA_UNKNOWN_LOCATION } from '../../../components/DeviceInfoBlock/mocks';
import { MOCK_ERROR } from './mocks';

export default {
  title: 'Pages/Pair/AuthComplete',
  component: AuthComplete,
  decorators: [withLocalization],
} as Meta;

// Any metadata mock from DeviceInfoBlock will do, location is not displayed on this page
export const Default = () => (
  <AuthComplete suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION} />
);

export const SupportsFirefoxView = () => (
  <AuthComplete
    suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
    supportsFirefoxView
  />
);

export const WithErrorMessage = () => (
  <AuthComplete
    suppDeviceInfo={MOCK_METADATA_UNKNOWN_LOCATION}
    error={MOCK_ERROR}
  />
);
