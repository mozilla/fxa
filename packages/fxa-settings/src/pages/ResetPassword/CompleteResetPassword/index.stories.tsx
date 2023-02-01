/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AppLayout from '../../../components/AppLayout';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import CompleteResetPassword, { CompleteResetPasswordProps } from '.';
import { MOCK_ACCOUNT } from '../../../models/mocks';

export default {
  title: 'pages/ResetPassword/CompleteResetPassword',
  component: CompleteResetPassword,
} as Meta;

const storyWithProps = (props?: Partial<CompleteResetPasswordProps>) => {
  const story = () => (
    <LocationProvider>
      <AppLayout>
        <CompleteResetPassword
          email={MOCK_ACCOUNT.primaryEmail.email}
          linkStatus="valid"
        />
      </AppLayout>
    </LocationProvider>
  );
  return story;
};

export const Default = storyWithProps();

export const ValidWithSyncWarning = storyWithProps({
  resetPasswordConfirm: true,
});

export const WithExpiredLink = storyWithProps({
  linkStatus: 'expired',
});

export const WithDamagedLink = storyWithProps({
  linkStatus: 'damaged',
});
