/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ResetPassword, { ResetPasswordProps } from '.';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MOCK_ACCOUNT } from '../../models/mocks';
import { MozServices } from '../../lib/types';
import { withLocalization } from '../../../.storybook/decorators';
import { Account, AppContext } from '../../models';
import {
  mockAccountWithThrottledError,
  mockAccountWithUnexpectedError,
  mockDefaultAccount,
} from './mocks';

export default {
  title: 'Pages/ResetPassword',
  component: ResetPassword,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = (
  account: Account,
  props?: Partial<ResetPasswordProps>
) => {
  const story = () => (
    <AppContext.Provider value={{ account }}>
      <LocationProvider>
        <ResetPassword {...props} />
      </LocationProvider>
    </AppContext.Provider>
  );
  return story;
};

export const Default = storyWithProps(mockDefaultAccount);

export const WithServiceName = storyWithProps(mockDefaultAccount, {
  serviceName: MozServices.MozillaVPN,
});

export const WithForceAuth = storyWithProps(mockDefaultAccount, {
  prefillEmail: MOCK_ACCOUNT.primaryEmail.email,
  forceAuth: true,
});

export const WithThrottledErrorOnSubmit = storyWithProps(
  mockAccountWithThrottledError
);

export const WithUnexpectedErrorOnSubmit = storyWithProps(
  mockAccountWithUnexpectedError
);
