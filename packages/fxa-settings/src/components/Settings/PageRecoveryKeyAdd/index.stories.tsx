/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { PageRecoveryKeyAdd } from '.';
import { LocationProvider } from '@reach/router';
import AppLayout from '../AppLayout';
import { Meta } from '@storybook/react';

export default {
  title: 'pages/Settings/RecoveryKeyAdd',
  component: PageRecoveryKeyAdd,
} as Meta;

export const Default = () => (
  <LocationProvider>
    <AppLayout>
      <PageRecoveryKeyAdd />
    </AppLayout>
  </LocationProvider>
);
