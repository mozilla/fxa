/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import PageCreatePassword from '.';
import React from 'react';
import AppLayout from '../AppLayout';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';

export default {
  title: 'pages/CreatePassword',
  component: PageCreatePassword,
} as Meta;

export const Default = () => (
  <LocationProvider>
    <AppLayout>
      <PageCreatePassword />
    </AppLayout>
  </LocationProvider>
);
