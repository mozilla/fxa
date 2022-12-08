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

const storyWithProps = (props?: CompleteResetPasswordProps) => {
  const story = () => (
    <LocationProvider>
      <AppLayout>
        <CompleteResetPassword {...props} />
      </AppLayout>
    </LocationProvider>
  );
  return story;
};

export const Default = storyWithProps();

export const ValidLinkWithSyncWarning = storyWithProps({
  showSyncWarning: true,
});

export const ValidLinkWithAccountRecoveryInfo = storyWithProps({
  showAccountRecoveryInfo: true,
});

export const WithExpiredLink = storyWithProps({ isLinkExpired: true });

export const WithDamagedLink = storyWithProps({ isLinkDamaged: true });
