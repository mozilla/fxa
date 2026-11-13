/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { DataCollection, DataCollectionProps } from '.';
import { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withLocalization, withLocation } from 'fxa-react/lib/storybooks';
import { mockAppContext } from '../../../models/mocks';
import { Account, AppContext } from '../../../models';
import { MOCK_MANY_SYNC_DEVICES, MOCK_SYNC_DEVICES } from './mocks';

export default {
  title: 'Components/Settings/DataCollection',
  component: DataCollection,
  decorators: [withLocalization, withLocation()],
} as Meta;

const accountWithMetrics = {
  metricsEnabled: true,
} as unknown as Account;

const accountWithoutMetrics = {
  metricsEnabled: false,
} as unknown as Account;

const storyWithContext = (
  account: Partial<Account>,
  props: DataCollectionProps = {}
) => {
  const context = { account: account as Account };

  const story = () => (
    <AppContext.Provider value={mockAppContext(context)}>
      <DataCollection {...props} />
    </AppContext.Provider>
  );
  return story;
};

export const CollectionOn = storyWithContext(accountWithMetrics);

export const CollectionOff = storyWithContext(accountWithoutMetrics);

const syncedData = (
  overrides: Partial<NonNullable<DataCollectionProps['syncedData']>> = {}
): DataCollectionProps => ({
  syncedData: {
    devices: MOCK_SYNC_DEVICES,
    canOpenSyncPreferences: true,
    onConfirmDelete: action('onConfirmDelete'),
    ...overrides,
  },
});

type Story = StoryObj<typeof DataCollection>;

export const SyncedDataWarningModal: Story = {
  name: 'Synced data / Option 1: warning modal',
  render: storyWithContext(accountWithMetrics, syncedData()),
};

export const SyncedDataWarningModalOneDevice: Story = {
  name: 'Synced data / Option 1: warning modal, with 1 device',
  render: storyWithContext(
    accountWithMetrics,
    syncedData({ devices: MOCK_SYNC_DEVICES.slice(0, 1) })
  ),
};

export const SyncedDataWarningModalManyDevices: Story = {
  name: 'Synced data / Option 1: warning modal, with 12 devices',
  render: storyWithContext(
    accountWithMetrics,
    syncedData({ devices: MOCK_MANY_SYNC_DEVICES })
  ),
};

export const SyncedDataSignOutModal: Story = {
  name: 'Synced data / Option 2: sign-out modal',
  render: storyWithContext(
    accountWithMetrics,
    syncedData({ modalVariant: 'signOut' })
  ),
};

export const SyncedDataSignOutModalOneDevice: Story = {
  name: 'Synced data / Option 2: sign-out modal, with 1 device',
  render: storyWithContext(
    accountWithMetrics,
    syncedData({
      modalVariant: 'signOut',
      devices: MOCK_SYNC_DEVICES.slice(0, 1),
    })
  ),
};

export const SyncedDataSignOutModalManyDevices: Story = {
  name: 'Synced data / Option 2: sign-out modal, with 12 devices',
  render: storyWithContext(
    accountWithMetrics,
    syncedData({ modalVariant: 'signOut', devices: MOCK_MANY_SYNC_DEVICES })
  ),
};

export const SyncedDataOutsideFirefoxDesktop: Story = {
  name: 'Synced data / Outside Firefox Desktop (no settings link)',
  render: storyWithContext(
    accountWithMetrics,
    syncedData({ canOpenSyncPreferences: false })
  ),
};
