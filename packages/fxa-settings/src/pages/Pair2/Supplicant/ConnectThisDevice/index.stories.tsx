/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import ConnectThisDevice, { ConnectThisDeviceProps } from '.';
import {
  MOCK_AUTH_DEVICE_INFO,
  MOCK_AUTH_DEVICE_INFO_UNKNOWN_LOCATION,
  MOCK_EMAIL,
} from './mocks';

export default {
  title: 'Pages/Pair2/Supplicant/ConnectThisDevice',
  component: ConnectThisDevice,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = (props?: Partial<ConnectThisDeviceProps>) => {
  const story = () => (
    <ConnectThisDevice
      email={MOCK_EMAIL}
      authDeviceInfo={MOCK_AUTH_DEVICE_INFO}
      {...props}
    />
  );
  return story;
};

export const Default = storyWithProps();

export const WithUnknownLocation = storyWithProps({
  authDeviceInfo: MOCK_AUTH_DEVICE_INFO_UNKNOWN_LOCATION,
});

export const WithShortEmail = storyWithProps({ email: 'me@example.com' });
