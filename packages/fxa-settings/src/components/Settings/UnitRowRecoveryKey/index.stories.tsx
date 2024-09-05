/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { LocationProvider } from '@reach/router';
import UnitRowRecoveryKey from '.';
import { Account, AppContext } from 'fxa-settings/src/models';
import { mockAppContext } from 'fxa-settings/src/models/mocks';
import { Config } from '../../../lib/config';

export default {
  title: 'Components/Settings/UnitRowRecoveryKey',
  component: UnitRowRecoveryKey,
  decorators: [withLocalization],
} as Meta;

const accountHasRecoveryKey = {
  hasPassword: true,
  recoveryKey: { exist: true },
} as unknown as Account;

const accountWithoutRecoveryKey = {
  hasPassword: true,
  recoveryKey: { exists: false },
} as unknown as Account;

const accountWithoutPassword = {
  hasPassword: false,
  recoveryKey: { exists: false },
} as unknown as Account;

const storyWithContext = (
  account: Partial<Account>,
  config?: Partial<Config>
) => {
  const context = { account: account as Account, config: config as Config };

  const story = () => (
    <LocationProvider>
      <AppContext.Provider value={mockAppContext(context)}>
        <UnitRowRecoveryKey />
      </AppContext.Provider>
    </LocationProvider>
  );
  return story;
};

export const HasAccountRecoveryKeyVersion = storyWithContext(
  accountHasRecoveryKey
);

export const NoAccountRecoveryKeyVersion = storyWithContext(
  accountWithoutRecoveryKey
);

export const DisabledStateNoPasswordVersion = storyWithContext(
  accountWithoutPassword
);
