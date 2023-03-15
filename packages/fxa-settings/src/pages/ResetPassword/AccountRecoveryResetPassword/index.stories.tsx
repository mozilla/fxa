/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AccountRecoveryResetPassword, {
  AccountRecoveryResetPasswordProps,
} from '.';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from '../../../../.storybook/decorators';
import { AppContext, AppContextValue } from '../../../models';
import {
  mockUrlSearchContext,
  mockUrlHashContext,
  mockStorageContext,
  mockAccount,
  mockRelierFactory,
  mockLocationContext,
} from './mocks';
import { mockAppContext } from '../../../models/mocks';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';

export default {
  title: 'Pages/ResetPassword/AccountRecoveryResetPassword',
  component: AccountRecoveryResetPassword,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = (
  ctx: AppContextValue,
  props: AccountRecoveryResetPasswordProps
) => {
  return (
    <AppContext.Provider value={ctx}>
      <LocationProvider>
        <AccountRecoveryResetPassword {...props} />
      </LocationProvider>
    </AppContext.Provider>
  );
};

function setup() {
  const account = mockAccount();
  const navigate = async (to: string | number, opts?: {}) => {
    console.log('Would navigate to', to, opts);
  };
  const urlSearchContext = mockUrlSearchContext();
  const urlHashContext = mockUrlHashContext();
  const storageContext = mockStorageContext();
  const locationContext = mockLocationContext();
  const relierFactory = mockRelierFactory(
    urlSearchContext,
    urlHashContext,
    storageContext
  );

  const ctx = mockAppContext({
    urlSearchContext,
    urlHashContext,
    storageContext,
    account,
    relierFactory,
  });

  return {
    ctx,
    props: {
      overrides: {
        navigate,
        urlSearchContext,
        locationContext,
      },
    },
    account,
    urlSearchContext,
    locationContext,
  };
}

export const WithValidLink = () => {
  const { props, ctx } = setup();
  return storyWithProps(ctx, props);
};

export const WithExpiredLink = () => {
  const { props, ctx, account } = setup();
  // Mock the response. An INVALID_TOKEN means the link expired.
  account.resetPasswordWithRecoveryKey = async () => {
    const err = AuthUiErrors['INVALID_TOKEN'];
    throw err;
  };
  return storyWithProps(ctx, props);
};

export const WithBrokenLink = () => {
  const { props, urlSearchContext, ctx } = setup();
  urlSearchContext.set('email', 'foobar.com');
  return storyWithProps(ctx, props);
};

export const WithBrokenRecoveryKeyState = () => {
  const { props, locationContext, ctx } = setup();
  locationContext.set('kB', '');
  return storyWithProps(ctx, props);
};
