/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ConnectAnotherDevice from '.';
import { Devices } from '../../lib/utilities';
import { MemoryRouter } from 'react-router';
import { ENTRYPOINTS } from '../../constants';
import { Meta } from '@storybook/react';
import { MOCK_ACCOUNT } from '../../models/mocks';
import {
  MOCK_BASIC_PROPS,
  MOCK_DEFAULTS,
  MOCK_DEVICE_BASIC_PROPS,
  mockFxAStatus,
} from './mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Pages/ConnectAnotherDevice',
  component: ConnectAnotherDevice,
  decorators: [
    withLocalization,
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} as Meta;

export const CanSignInNoSuccessMessage = () => (
  <ConnectAnotherDevice
    email={MOCK_ACCOUNT.primaryEmail.email}
    entrypoint={ENTRYPOINTS.FIREFOX_FX_VIEW_ENTRYPOINT}
    device={Devices.FIREFOX_DESKTOP}
    showSuccessMessage={false}
    isSignIn={false}
    isSignUp={false}
    isSignedIn={false}
    canSignIn
    fxaStatus={mockFxAStatus()}
  />
);

export const CannotSignIn = () => (
  <ConnectAnotherDevice isSignIn={false} isSignUp {...MOCK_BASIC_PROPS} />
);
export const WithSignupSuccessMessage = () => (
  <ConnectAnotherDevice
    isSignIn={false}
    isSignUp
    showSuccessMessage
    isSignedIn={false}
    canSignIn
    {...MOCK_DEFAULTS}
    fxaStatus={mockFxAStatus()}
  />
);

export const WithSignInSuccessMessage = () => (
  <ConnectAnotherDevice
    isSignIn
    isSignUp={false}
    showSuccessMessage
    isSignedIn={false}
    canSignIn
    {...MOCK_DEFAULTS}
    fxaStatus={mockFxAStatus()}
  />
);

export const WithFirefoxDesktop = () => (
  <ConnectAnotherDevice
    device={Devices.FIREFOX_DESKTOP}
    {...MOCK_DEVICE_BASIC_PROPS}
  />
);

export const WithFirefoxAndroid = () => (
  <ConnectAnotherDevice
    device={Devices.FIREFOX_ANDROID}
    {...MOCK_DEVICE_BASIC_PROPS}
  />
);

export const WithFirefoxIos = () => (
  <ConnectAnotherDevice
    device={Devices.FIREFOX_IOS}
    {...MOCK_DEVICE_BASIC_PROPS}
  />
);

export const WithOtherAndroid = () => (
  <ConnectAnotherDevice
    device={Devices.OTHER_ANDROID}
    {...MOCK_DEVICE_BASIC_PROPS}
  />
);

export const WithOtherIos = () => (
  <ConnectAnotherDevice
    device={Devices.OTHER_IOS}
    {...MOCK_DEVICE_BASIC_PROPS}
  />
);

export const WithOther = () => (
  <ConnectAnotherDevice device={Devices.OTHER} {...MOCK_DEVICE_BASIC_PROPS} />
);
