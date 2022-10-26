/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { PageChangePassword } from '.';
import { LocationProvider } from '@reach/router';
import AppLayout from '../AppLayout';

export default {
  title: 'pages/ChangePassword',
  component: PageChangePassword,
};

export const Default = () => (
  <LocationProvider>
    <AppLayout>
      <PageChangePassword />
    </AppLayout>
  </LocationProvider>
);
