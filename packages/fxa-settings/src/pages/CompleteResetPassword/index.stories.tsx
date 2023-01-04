/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AppLayout from '../../components/AppLayout';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import CompleteResetPassword, { CompleteResetPasswordProps } from '.';

export default {
  title: 'pages/CompleteResetPassword',
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

export const WithValidLink = storyWithProps({ linkStatus: 'valid' });

export const WithSyncWarning = storyWithProps({
  linkStatus: 'valid',
  showSyncWarning: true,
});

export const WithAccountRecoveryInfo = storyWithProps({
  linkStatus: 'valid',
  showAccountRecoveryInfo: true,
});

export const WithExpiredLink = storyWithProps({ linkStatus: 'expired' });

export const WithDamagedLink = storyWithProps({ linkStatus: 'damaged' });
