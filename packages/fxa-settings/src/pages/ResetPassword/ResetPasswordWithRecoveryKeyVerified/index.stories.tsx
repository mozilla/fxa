/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ResetPasswordWithRecoveryKeyVerified from '.';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from '../../../../.storybook/decorators';

export default {
  title: 'Pages/ResetPassword/ResetPasswordWithRecoveryKeyVerified',
  component: ResetPasswordWithRecoveryKeyVerified,
  decorators: [withLocalization],
} as Meta;

export const DefaultSignedIn = () => (
  <LocationProvider>
    <ResetPasswordWithRecoveryKeyVerified isSignedIn />
  </LocationProvider>
);

export const DefaultSignedOut = () => (
  <LocationProvider>
    <ResetPasswordWithRecoveryKeyVerified isSignedIn={false} />
  </LocationProvider>
);

export const WithSync = () => (
  <LocationProvider>
    <ResetPasswordWithRecoveryKeyVerified isSignedIn isSync />
  </LocationProvider>
);
