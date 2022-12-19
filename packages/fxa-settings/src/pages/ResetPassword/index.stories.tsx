/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ResetPassword, { ResetPasswordProps } from '.';
import AppLayout from '../../components/AppLayout';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MOCK_SERVICE_NAME, MOCK_EMAIL } from './mocks';

export default {
  title: 'pages/ResetPassword',
  component: ResetPassword,
} as Meta;

const storyWithProps = (props?: ResetPasswordProps) => {
  const story = () => (
    <LocationProvider>
      <AppLayout>
        <ResetPassword {...props} />
      </AppLayout>
    </LocationProvider>
  );
  return story;
};

export const Default = storyWithProps();

export const WithServiceName = storyWithProps({
  serviceName: MOCK_SERVICE_NAME,
});

export const WithForcedEmail = storyWithProps({
  forceEmail: MOCK_EMAIL,
});

export const CanGoBack = storyWithProps({
  canGoBack: true,
});
