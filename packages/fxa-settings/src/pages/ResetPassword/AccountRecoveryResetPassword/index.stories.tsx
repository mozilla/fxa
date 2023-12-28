/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AccountRecoveryResetPassword from '.';
import {
  LocationProvider,
  History,
  createMemorySource,
  createHistory,
} from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { AppContext, AppContextValue } from '../../../models';
import {
  createMockAccountRecoveryResetPasswordSyncDesktopV3Integration,
  mockAccount,
} from './mocks';
import { mockAppContext } from '../../../models/mocks';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';

export default {
  title: 'Pages/ResetPassword/AccountRecoveryResetPassword',
  component: AccountRecoveryResetPassword,
  decorators: [withLocalization],
} as Meta;

const baseUrl = `http://${window.location.host}/?`;

const storyWithProps = (ctx: AppContextValue, history?: History) => {
  return (
    <AppContext.Provider value={ctx}>
      <LocationProvider {...{ history }}>
        <AccountRecoveryResetPassword
          integration={createMockAccountRecoveryResetPasswordSyncDesktopV3Integration()}
        />
      </LocationProvider>
    </AppContext.Provider>
  );
};

function setup() {
  const account = mockAccount();
  const source = createMemorySource('/reset_password');
  const history = createHistory(source);

  // Create the default url state
  const href = `${baseUrl}`;
  history.location.href = href;
  history.location.search =
    'email=foo%40email.com&emailToHashWith=foo%40email.com&code=123&token=1234&uid=1234';
  history.location.state = {
    kB: '1234',
    accountResetToken: '1234',
    recoveryKeyId: '1234',
  };

  const ctx = mockAppContext({
    account,
  });

  return {
    ctx,
    history,
  };
}

export const WithValidLink = () => {
  const { ctx, history } = setup();
  return storyWithProps(ctx, history);
};

export const OnSubmitLinkExpired = () => {
  const { ctx, history } = setup();
  // Mock the response. An INVALID_TOKEN means the link expired.
  ctx.account!.resetPasswordWithRecoveryKey = async () => {
    const err = AuthUiErrors['INVALID_TOKEN'];
    throw err;
  };
  return storyWithProps(ctx, history);
};

// An invalid link should result in a damaged link error.
export const WithDamagedLink = () => {
  const { ctx, history } = setup();
  // An email must have an @ symbol.
  history.location.search = 'email=foo';
  return storyWithProps(ctx, history);
};

export const WithBrokenRecoveryKeyState = () => {
  const { ctx, history } = setup();
  // An empty kb value should indicate a bad recovery key state.
  history.location.state.kB = '';
  return storyWithProps(ctx, history);
};
