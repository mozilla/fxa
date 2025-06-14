/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import SignupConfirmedSync from '.';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { createMockIntegration } from './mocks';

export default {
  title: 'Pages/Signup/SignupConfirmedSync',
  component: SignupConfirmedSync,
  decorators: [withLocalization],
} as Meta;

export const Desktop = () => (
  <LocationProvider>
    <SignupConfirmedSync
      integration={createMockIntegration()}
      paymentMethodsSynced
    />
  </LocationProvider>
);

export const DesktopWithoutPaymentMethodsSync = () => (
  <LocationProvider>
    <SignupConfirmedSync
      integration={createMockIntegration()}
      paymentMethodsSynced={false}
    />
  </LocationProvider>
);

export const MobileNotCurrentlyUsed = () => (
  <LocationProvider>
    <SignupConfirmedSync
      integration={createMockIntegration({ isDesktopSync: false })}
      paymentMethodsSynced
    />
  </LocationProvider>
);
