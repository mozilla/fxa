/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AccountRecoveryResetPassword, {
  AccountRecoveryResetPasswordProps,
} from '.';
import AppLayout from '../../components/AppLayout';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MOCK_EMAIL } from './mocks';

export default {
  title: 'pages/AccountRecoveryResetPassword',
  component: AccountRecoveryResetPassword,
} as Meta;

const storyWithProps = (props: AccountRecoveryResetPasswordProps) => {
  const story = () => (
    <LocationProvider>
      <AppLayout>
        <AccountRecoveryResetPassword {...props} />
      </AppLayout>
    </LocationProvider>
  );
  return story;
};

export const WithValidLink = storyWithProps({
  email: MOCK_EMAIL,
  linkStatus: 'valid',
});

export const WithBrokenLink = storyWithProps({
  email: MOCK_EMAIL,
  linkStatus: 'damaged',
});

export const WithExpiredLink = storyWithProps({
  email: MOCK_EMAIL,
  linkStatus: 'expired',
});
