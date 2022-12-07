/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ResetPasswordConfirmed from '.';
import AppLayout from '../../components/AppLayout';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';

export default {
  title: 'pages/ResetPasswordConfirmed',
  component: ResetPasswordConfirmed,
} as Meta;

export const Default = () => (
  <LocationProvider>
    <AppLayout>
      <ResetPasswordConfirmed />
    </AppLayout>
  </LocationProvider>
);

export const WithRelyingPartyNoContinueAction = () => (
  <LocationProvider>
    <AppLayout>
      <ResetPasswordConfirmed serviceName={'ExampleService'} />
    </AppLayout>
  </LocationProvider>
);

export const WithRelyingPartyAndContinueAction = () => (
  <LocationProvider>
    <AppLayout>
      <ResetPasswordConfirmed
        serviceName={'Example Service'}
        continueHandler={() => {
          console.log('Arbitrary action');
        }}
      />
    </AppLayout>
  </LocationProvider>
);
