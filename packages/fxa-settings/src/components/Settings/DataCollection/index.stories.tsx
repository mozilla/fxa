/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { DataCollection } from '.';
import { Meta, StoryObj } from '@storybook/react';
import { withLocalization, withLocation } from 'fxa-react/lib/storybooks';
import { mockAppContext } from '../../../models/mocks';
import { getDefault } from '../../../lib/config';
import { Account, AppContext } from '../../../models';
import { MOCK_SYNC_CLIENTS } from './mocks';

export default {
  title: 'Components/Settings/DataCollection',
  component: DataCollection,
  decorators: [withLocalization, withLocation()],
} as Meta;

const accountWithMetrics = {
  metricsEnabled: true,
  attachedClients: [],
} as unknown as Account;

const accountWithoutMetrics = {
  metricsEnabled: false,
  attachedClients: [],
} as unknown as Account;

const accountWithSyncDevices = {
  metricsEnabled: true,
  hasPassword: true,
  attachedClients: MOCK_SYNC_CLIENTS,
} as unknown as Account;

const defaultConfig = getDefault();
const config = {
  ...defaultConfig,
  featureFlags: {
    ...defaultConfig.featureFlags,
    syncDataDeletionEnabled: true,
  },
};

const storyWithContext = (account: Partial<Account>) => () => (
  <AppContext.Provider
    value={mockAppContext({ account: account as Account, config })}
  >
    <DataCollection />
  </AppContext.Provider>
);

export const CollectionOn = storyWithContext(accountWithMetrics);

export const CollectionOff = storyWithContext(accountWithoutMetrics);

type Story = StoryObj<typeof DataCollection>;

// The "Account and sync" link is active when viewed in Firefox Desktop.
export const SyncedData: Story = {
  name: 'Synced data row',
  render: storyWithContext(accountWithSyncDevices),
};
