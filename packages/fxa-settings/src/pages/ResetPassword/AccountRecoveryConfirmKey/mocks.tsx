/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { MozServices } from '../../../lib/types';
import { History, LocationProvider } from '@reach/router';
import { Account, AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';
import AccountRecoveryConfirmKey from '.';

export const MOCK_SERVICE_NAME = MozServices.FirefoxSync;
export const MOCK_RECOVERY_KEY = 'ARJDF300TFEPRJ7SFYB8QVNVYT60WWS2';
export const MOCK_RESET_TOKEN = 'mockResetToken';
export const MOCK_RECOVERY_KEY_ID = 'mockRecoveryKeyId';
export const MOCK_KB = 'mockkB';

export const Subject = ({
  account,
  history,
}: {
  account: Account;
  history?: History;
}) => (
  <AppContext.Provider value={mockAppContext({ account })}>
    <LocationProvider {...{ history }}>
      <AccountRecoveryConfirmKey />
    </LocationProvider>
  </AppContext.Provider>
);
