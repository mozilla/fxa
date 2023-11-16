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
import { Config, getDefault } from '../../../lib/config';

export default {
  title: 'Components/Settings/UnitRowRecoveryKey',
  component: UnitRowRecoveryKey,
  decorators: [withLocalization],
} as Meta;

const accountHasRecoveryKey = {
  hasPassword: true,
  recoveryKey: true,
} as unknown as Account;

const accountWithoutRecoveryKey = {
  hasPassword: true,
  recoveryKey: false,
} as unknown as Account;

const accountWithoutPassword = {
  hasPassword: false,
  recoveryKey: false,
} as unknown as Account;

// Remove featureFlagConfig in FXA-7419
const featureFlagConfig = {
  ...getDefault(),
  showRecoveryKeyV2: true,
} as unknown as Config;

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
// Remove first three stories in FXA-7419
export const HasAccountRecoveryKey = storyWithContext(accountHasRecoveryKey);

export const NoAccountRecoveryKey = storyWithContext(accountWithoutRecoveryKey);

export const DisabledStateNoPassword = storyWithContext(accountWithoutPassword);

export const HasAccountRecoveryKeyVersion2 = storyWithContext(
  accountHasRecoveryKey,
  featureFlagConfig
);

export const NoAccountRecoveryKeyVersion2 = storyWithContext(
  accountWithoutRecoveryKey,
  featureFlagConfig
);

export const DisabledStateNoPasswordVersion2 = storyWithContext(
  accountWithoutPassword,
  featureFlagConfig
);
