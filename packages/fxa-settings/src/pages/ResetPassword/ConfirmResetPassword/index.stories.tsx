/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ConfirmResetPassword from '.';
import AppLayout from '../../../components/AppLayout';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MOCK_EMAIL } from './mocks';

export default {
  title: 'pages/ResetPassword/ConfirmResetPassword',
  component: ConfirmResetPassword,
} as Meta;

const storyWithProps = ({ ...props }) => {
  const story = () => (
    <LocationProvider>
      <AppLayout>
        <ConfirmResetPassword email={MOCK_EMAIL} {...props} />
      </AppLayout>
    </LocationProvider>
  );
  return story;
};

export const Default = storyWithProps({});

export const WithForceAuth = storyWithProps({
  forceAuth: true,
  canSignIn: true,
});

export const WithLinkRememberPassword = storyWithProps({
  canSignIn: true,
});
