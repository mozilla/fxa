/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import {
  MOCK_ACCOUNT,
  mockAppContext,
  mockSession,
} from '../../../models/mocks';
import { Account, AppContext } from '../../../models';
import Page2faSetup from '.';
import {
  LocationProvider,
  createHistory,
  createMemorySource,
  NavigateFn,
} from '@reach/router';
import { action } from '@storybook/addon-actions';
import {
  MOCK_2FA_SECRET_KEY_RAW,
  MOCK_BACKUP_CODES,
  PLACEHOLDER_QR_CODE,
} from '../../../pages/mocks';

export const MOCK_TOTP_INFO = {
  qrCodeUrl: PLACEHOLDER_QR_CODE,
  secret: MOCK_2FA_SECRET_KEY_RAW,
  recoveryCodes: MOCK_BACKUP_CODES,
};

// Create a safe navigate function for Storybook that matches NavigateFn type
const createSafeNavigate = (): NavigateFn => {
  return (to: string | number, options?: any) => {
    action('Navigate')(`to: ${to}`, options);
    return Promise.resolve();
  };
};

export const Subject = ({ account: accountOverrides = {} }) => {
  const account = {
    ...MOCK_ACCOUNT,
    createTotp: async () => {
      action('createTotp called')();
      return MOCK_TOTP_INFO;
    },
    ...accountOverrides,
  } as Account;

  const source = createMemorySource('/settings/two_step_authentication');
  const history = createHistory(source);
  const historyWithSafeNavigate = {
    ...history,
    navigate: createSafeNavigate(),
  };

  return (
    <LocationProvider history={historyWithSafeNavigate}>
      <AppContext.Provider
        value={{
          ...mockAppContext({ account }),
          session: mockSession(true),
        }}
      >
        <Page2faSetup />
      </AppContext.Provider>
    </LocationProvider>
  );
};
