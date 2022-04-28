/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Subject } from './mocks';
import { LocationProvider } from '@reach/router';
import AppLayout from '../AppLayout';
import FormPassword from '.';
import { Meta } from '@storybook/react';

export default {
  title: 'components/FormPassword',
  component: FormPassword,
} as Meta;

export const WithCurrentPassword = () => (
  <LocationProvider>
    <AppLayout>
      <div className="max-w-lg mx-auto">
        <Subject />
      </div>
    </AppLayout>
  </LocationProvider>
);

export const WithoutCurrentPassword = () => (
  <LocationProvider>
    <AppLayout>
      <div className="max-w-lg mx-auto">
        <Subject includeCurrentPw={false} />
      </div>
    </AppLayout>
  </LocationProvider>
);
