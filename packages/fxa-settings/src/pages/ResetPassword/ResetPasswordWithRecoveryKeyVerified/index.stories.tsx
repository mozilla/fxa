/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ResetPasswordWithRecoveryKeyVerified from '.';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';

export default {
  title: 'pages/ResetPassword/ResetPasswordWithRecoveryKeyVerified',
  component: ResetPasswordWithRecoveryKeyVerified,
} as Meta;

export const Default = () => (
  <LocationProvider>
      <ResetPasswordWithRecoveryKeyVerified />
  </LocationProvider>
);

export const WithSync = () => (
  <LocationProvider>
      <ResetPasswordWithRecoveryKeyVerified isSync />
  </LocationProvider>
);
