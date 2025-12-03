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
import { Page2faChange } from '.';
import {
  LocationProvider,
  createHistory,
  createMemorySource,
  NavigateFn,
} from '@reach/router';
import { action } from '@storybook/addon-actions';
import {
  MOCK_2FA_SECRET_KEY_RAW,
  PLACEHOLDER_QR_CODE,
} from '../../../pages/mocks';
import { MfaContext } from '../MfaGuard';

export const MOCK_TOTP_INFO = {
  qrCodeUrl: PLACEHOLDER_QR_CODE,
  secret: MOCK_2FA_SECRET_KEY_RAW,
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
    startReplaceTotpWithJwt: async () => {
      action('replaceTotp called')();
      return MOCK_TOTP_INFO;
    },
    confirmReplaceTotpWithJwt: async (code: string) => {
      action(`confirmReplaceTotp called with code: ${code}`)();
    },
    ...accountOverrides,
  } as Account;

  const source = createMemorySource('/settings/two_step_authentication/change');
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
        <MfaContext.Provider value="2fa">
          <Page2faChange />
        </MfaContext.Provider>
      </AppContext.Provider>
    </LocationProvider>
  );
};
