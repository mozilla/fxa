/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ResetPasswordConfirmed from '.';
import AppLayout from '../../../components/AppLayout';
import { MozServices } from '../../../lib/types';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MOCK_SERVICE_NAME } from '../ResetPassword/mocks';

export default {
  title: 'pages/ResetPassword/ResetPasswordConfirmed',
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
      <ResetPasswordConfirmed serviceName={MOCK_SERVICE_NAME} />
    </AppLayout>
  </LocationProvider>
);

export const WithRelyingPartyAndContinueAction = () => (
  <LocationProvider>
    <AppLayout>
      <ResetPasswordConfirmed
        serviceName={MOCK_SERVICE_NAME}
        continueHandler={() => {
          console.log('Arbitrary action');
        }}
      />
    </AppLayout>
  </LocationProvider>
);
