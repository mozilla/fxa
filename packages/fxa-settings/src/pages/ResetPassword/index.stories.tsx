/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ResetPassword from '.';
import AppLayout from '../../components/AppLayout';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MOCK_ACCOUNT } from '../../models/mocks';
import { MozServices } from '../../lib/types';

export default {
  title: 'pages/ResetPassword',
  component: ResetPassword,
} as Meta;

const storyWithProps = ({ ...props }) => {
  const story = () => (
    <LocationProvider>
      <AppLayout>
        <ResetPassword {...props} />
      </AppLayout>
    </LocationProvider>
  );
  return story;
};

export const Default = storyWithProps({});

export const WithServiceName = storyWithProps({
  serviceName: MozServices.MozillaVPN,
});

export const WithForceAuth = storyWithProps({
  prefillEmail: MOCK_ACCOUNT.primaryEmail.email,
  forceAuth: true,
});

export const CanGoBack = storyWithProps({
  canGoBack: true,
});
