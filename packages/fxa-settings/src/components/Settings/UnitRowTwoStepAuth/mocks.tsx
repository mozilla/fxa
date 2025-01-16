/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { mockAppContext, mockSettingsContext } from '../../../models/mocks';
import { Account, AppContext } from '../../../models';
import UnitRowTwoStepAuth from '.';
import { SettingsContext } from '../../../models/contexts/SettingsContext';
import { getDefault } from '../../../lib/config';

export const createSubject = (
  accountOverrides = {},
  settingsOverrides = {}
) => {
  const account = {
    hasPassword: true,
    backupCodes: { hasBackupCodes: true, count: 3 },
    totp: { exists: true, verified: true },
    recoveryPhone: { exists: false, phoneNumber: null, available: false },
    ...accountOverrides,
  } as unknown as Account;
  const config = {
    ...getDefault(),
    featureFlags: {
      enableAdding2FABackupPhone: true,
    },
  };
  const appContext = mockAppContext({ account, config });
  const settingsContext = mockSettingsContext(settingsOverrides);

  return (
    <AppContext.Provider value={appContext}>
      <SettingsContext.Provider value={settingsContext}>
        <UnitRowTwoStepAuth />
      </SettingsContext.Provider>
    </AppContext.Provider>
  );
};
