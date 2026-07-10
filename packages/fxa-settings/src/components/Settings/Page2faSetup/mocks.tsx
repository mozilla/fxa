/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  MOCK_ACCOUNT,
  mockAppContext,
  mockSession,
} from '../../../models/mocks';
import { Account, AppContext } from '../../../models';
import { Page2faSetup } from '.';
import { MemoryRouter } from 'react-router';
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

export const Subject = ({ account: accountOverrides = {} }) => {
  const account = {
    ...MOCK_ACCOUNT,
    createTotpWithJwt: async () => {
      action('createTotp called')();
      return MOCK_TOTP_INFO;
    },
    ...accountOverrides,
  } as Account;

  return (
    <MemoryRouter>
      <AppContext.Provider
        value={{
          ...mockAppContext({ account }),
          session: mockSession(true),
        }}
      >
        <MfaContext.Provider value="2fa">
          <Page2faSetup />
        </MfaContext.Provider>
      </AppContext.Provider>
    </MemoryRouter>
  );
};
