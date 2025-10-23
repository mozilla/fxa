/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import ConnectAnotherDevice, { Devices } from '.';
import AppLayout from '../../components/AppLayout';
import { ENTRYPOINTS } from '../../constants';
import { MOCK_ACCOUNT } from '../../models/mocks';
import {
  MOCK_BASIC_PROPS,
  MOCK_DEFAULTS,
  MOCK_DEVICE_BASIC_PROPS,
} from './mocks';

export default {
  title: 'Pages/ConnectAnotherDevice',
  component: ConnectAnotherDevice,
  decorators: [withLocalization],
} as Meta;

export const CanSignInNoSuccessMessage = () => (
  <AppLayout>
    <ConnectAnotherDevice
      email={MOCK_ACCOUNT.primaryEmail.email}
      entrypoint={ENTRYPOINTS.FIREFOX_FX_VIEW_ENTRYPOINT}
      device={Devices.FIREFOX_DESKTOP}
      showSuccessMessage={false}
      isSignIn={false}
      isSignUp={false}
      isSignedIn={false}
      canSignIn
    />
  </AppLayout>
);

export const CannotSignIn = () => (
  <AppLayout>
    <ConnectAnotherDevice isSignIn={false} isSignUp {...MOCK_BASIC_PROPS} />
  </AppLayout>
);
export const WithSignupSuccessMessage = () => (
  <AppLayout>
    <ConnectAnotherDevice
      isSignIn={false}
      isSignUp
      showSuccessMessage
      isSignedIn={false}
      canSignIn
      {...MOCK_DEFAULTS}
    />
  </AppLayout>
);

export const WithSignInSuccessMessage = () => (
  <AppLayout>
    <ConnectAnotherDevice
      isSignIn
      isSignUp={false}
      showSuccessMessage
      isSignedIn={false}
      canSignIn
      {...MOCK_DEFAULTS}
    />
  </AppLayout>
);

export const WithFirefoxDesktop = () => (
  <AppLayout>
    <ConnectAnotherDevice
      device={Devices.FIREFOX_DESKTOP}
      {...MOCK_DEVICE_BASIC_PROPS}
    />
  </AppLayout>
);

export const WithFirefoxAndroid = () => (
  <AppLayout>
    <ConnectAnotherDevice
      device={Devices.FIREFOX_ANDROID}
      {...MOCK_DEVICE_BASIC_PROPS}
    />
  </AppLayout>
);

export const WithFirefoxIos = () => (
  <AppLayout>
    <ConnectAnotherDevice
      device={Devices.FIREFOX_IOS}
      {...MOCK_DEVICE_BASIC_PROPS}
    />
  </AppLayout>
);

export const WithOtherAndroid = () => (
  <AppLayout>
    <ConnectAnotherDevice
      device={Devices.OTHER_ANDROID}
      {...MOCK_DEVICE_BASIC_PROPS}
    />
  </AppLayout>
);

export const WithOtherIos = () => (
  <AppLayout>
    <ConnectAnotherDevice
      device={Devices.OTHER_IOS}
      {...MOCK_DEVICE_BASIC_PROPS}
    />
  </AppLayout>
);

export const WithOther = () => (
  <AppLayout>
    <ConnectAnotherDevice device={Devices.OTHER} {...MOCK_DEVICE_BASIC_PROPS} />
  </AppLayout>
);
