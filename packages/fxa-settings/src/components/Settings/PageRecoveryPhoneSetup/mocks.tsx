/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { MOCK_ACCOUNT, mockAppContext } from '../../../models/mocks';
import { Account, AppContext } from '../../../models';
import PageRecoveryPhoneSetup from '.';
import { LocationProvider } from '@reach/router';

export const Subject = ({ account: accountOverrides = {} }) => {
  const account = {
    ...MOCK_ACCOUNT,
    ...accountOverrides,
  } as Account;
  const appContext = mockAppContext({ account });

  return (
    <LocationProvider>
      <AppContext.Provider value={appContext}>
        <PageRecoveryPhoneSetup />
      </AppContext.Provider>
    </LocationProvider>
  );
};
