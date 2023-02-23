/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import SignupConfirmed from '.';
import AppLayout from '../../../components/AppLayout';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from '../../../../.storybook/decorators';

export default {
  title: 'Pages/Signup/SignupConfirmed',
  component: SignupConfirmed,
  decorators: [withLocalization],
} as Meta;

export const DefaultSignedIn = () => (
  <LocationProvider>
    <AppLayout>
      <SignupConfirmed isSignedIn />
    </AppLayout>
  </LocationProvider>
);

export const DefaultSignedOut = () => (
  <LocationProvider>
    <AppLayout>
      <SignupConfirmed isSignedIn={false} />
    </AppLayout>
  </LocationProvider>
);
