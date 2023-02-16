/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AccountRecoveryResetPassword, {
  AccountRecoveryResetPasswordProps,
} from '.';
import AppLayout from '../../../components/AppLayout';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MOCK_ACCOUNT } from '../../../models/mocks';
import { withLocalization } from '../../../../.storybook/decorators';
import { LinkStatus } from '../../../lib/types';

export default {
  title: 'Pages/ResetPassword/AccountRecoveryResetPassword',
  component: AccountRecoveryResetPassword,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = (props?: Partial<AccountRecoveryResetPasswordProps>) => {
  const story = () => (
    <LocationProvider>
      <AppLayout>
        <AccountRecoveryResetPassword
          email={MOCK_ACCOUNT.primaryEmail.email}
          linkStatus="valid"
        />
      </AppLayout>
    </LocationProvider>
  );
  return story;
};

export const WithValidLink = storyWithProps();

export const WithBrokenLink = storyWithProps({
  linkStatus: LinkStatus.damaged,
});

export const WithExpiredLink = storyWithProps({
  linkStatus: LinkStatus.expired,
});
