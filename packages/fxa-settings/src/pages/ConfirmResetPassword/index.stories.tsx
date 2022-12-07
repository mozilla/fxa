/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ConfirmResetPassword, { ConfirmResetPasswordProps } from '.';
import AppLayout from '../../components/AppLayout';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MOCK_EMAIL } from './mocks';

export default {
  title: 'pages/ConfirmResetPassword',
  component: ConfirmResetPassword,
} as Meta;

const storyWithProps = (props?: ConfirmResetPasswordProps) => {
  const story = () => (
    <LocationProvider>
      <AppLayout>
        <ConfirmResetPassword {...props} />
      </AppLayout>
    </LocationProvider>
  );
  return story;
};

export const Default = storyWithProps({ email: MOCK_EMAIL });

export const WithForcedEmail = storyWithProps({
  forceEmail: MOCK_EMAIL,
  canSignIn: true,
});

export const WithLinkRememberPassword = storyWithProps({
  email: MOCK_EMAIL,
  canSignIn: true,
});
