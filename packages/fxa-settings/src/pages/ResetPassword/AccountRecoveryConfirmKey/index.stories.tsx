/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AccountRecoveryConfirmKey, { AccountRecoveryConfirmKeyProps } from '.';
import AppLayout from '../../../components/AppLayout';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MOCK_SERVICE_NAME } from './mocks';
import { withLocalization } from '../../../../.storybook/decorators';

export default {
  title: 'Pages/ResetPassword/AccountRecoveryConfirmKey',
  component: AccountRecoveryConfirmKey,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = (props: AccountRecoveryConfirmKeyProps) => {
  const story = () => (
    <LocationProvider>
      <AppLayout>
        <AccountRecoveryConfirmKey {...props} />
      </AppLayout>
    </LocationProvider>
  );
  return story;
};

export const ValidLinkWithDefaultService = storyWithProps({
  linkStatus: 'valid',
});

export const ValidLinkWithServiceName = storyWithProps({
  linkStatus: 'valid',
  serviceName: MOCK_SERVICE_NAME,
});

export const ExpiredLink = storyWithProps({ linkStatus: 'expired' });
