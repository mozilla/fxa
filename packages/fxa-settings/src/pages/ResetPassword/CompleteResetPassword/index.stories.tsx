/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AppLayout from '../../../components/AppLayout';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import CompleteResetPassword, { CompleteResetPasswordProps } from '.';
import { MOCK_EMAIL } from './mocks';

export default {
  title: 'pages/ResetPassword/CompleteResetPassword',
  component: CompleteResetPassword,
} as Meta;

const storyWithProps = (props: CompleteResetPasswordProps) => {
  const story = () => (
    <LocationProvider>
      <AppLayout>
        <CompleteResetPassword {...props} />
      </AppLayout>
    </LocationProvider>
  );
  return story;
};

export const WithValidLink = storyWithProps({
  email: MOCK_EMAIL,
  linkStatus: 'valid',
});

export const ValidWithSyncWarning = storyWithProps({
  email: MOCK_EMAIL,
  linkStatus: 'valid',
  resetPasswordConfirm: true,
});

export const WithExpiredLink = storyWithProps({
  email: MOCK_EMAIL,
  linkStatus: 'expired',
});

export const WithDamagedLink = storyWithProps({
  email: MOCK_EMAIL,
  linkStatus: 'damaged',
});
