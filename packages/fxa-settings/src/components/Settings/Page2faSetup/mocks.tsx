/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { MOCK_ACCOUNT, mockAppContext } from '../../../models/mocks';
import { Account, AppContext } from '../../../models';
import Page2faSetup from '.';
import { LocationProvider } from '@reach/router';
import { MOCK_2FA_SECRET_KEY_RAW, MOCK_BACKUP_CODES } from '../../../pages/mocks';

export const MOCK_TOTP_INFO = {
  qrCodeUrl: 'https://example.com/fake-qr.png',
  secret: MOCK_2FA_SECRET_KEY_RAW,
  recoveryCodes: MOCK_BACKUP_CODES,
};

export const Subject = ({ account: accountOverrides = {} }) => {
  const account = {
    ...MOCK_ACCOUNT,
    ...accountOverrides,
  } as Account;
  return (
    <LocationProvider>
      <AppContext.Provider value={{ ...mockAppContext({ account }) }}>
          <Page2faSetup />
      </AppContext.Provider>
    </LocationProvider>
  );
};
