/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import SignupConfirmed from '.';
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
    <SignupConfirmed isSignedIn isSync={false} />
  </LocationProvider>
);

export const DefaultSignedOut = () => (
  <LocationProvider>
    <SignupConfirmed isSignedIn={false} isSync={false} />
  </LocationProvider>
);

export const IsSync = () => (
  <LocationProvider>
    <SignupConfirmed isSignedIn={false} isSync />
  </LocationProvider>
);
