/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import PageRecoveryPhoneSetup from '.';
import { Account, AppContext } from '../../../models';
import { MOCK_ACCOUNT, mockAppContext } from '../../../models/mocks';

export const Subject = ({ account: accountOverrides = {} }) => {
  const account = {
    ...MOCK_ACCOUNT,
    ...accountOverrides,
  } as Account;
  return (
    <LocationProvider>
      <AppContext.Provider value={{ ...mockAppContext({ account }) }}>
        <PageRecoveryPhoneSetup />
      </AppContext.Provider>
    </LocationProvider>
  );
};
