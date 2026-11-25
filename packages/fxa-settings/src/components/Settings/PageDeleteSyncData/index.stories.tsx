/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withLocalization, withLocation } from 'fxa-react/lib/storybooks';
import { MfaContext } from '../../../lib/hooks';
import { PageDeleteSyncData } from '.';
import { Account, AppContext, AttachedClient } from '../../../models';
import { MOCK_ACCOUNT, mockAppContext } from '../../../models/mocks';
import { MOCK_SYNC_DEVICES } from '../DataCollection/mocks';
import { mockDeleteSyncDataAuthClient } from '../FlowDeleteSyncDataConfirmPwd/mocks';

const account = {
  ...MOCK_ACCOUNT,
  deleteSyncData: async () => action('deleteSyncData')(),
  disconnectClient: async (client: AttachedClient) =>
    action('disconnectClient')(client),
} as unknown as Account;

export default {
  title: 'Pages/Settings/DeleteSyncData',
  component: PageDeleteSyncData,
  decorators: [withLocalization, withLocation('/settings/delete_sync_data')],
} as Meta;

type Story = StoryObj<typeof PageDeleteSyncData>;

// Step stories live with FlowDeleteSyncDataConfirmPwd and FlowDeleteSyncDataDevices.
export const Default: Story = {
  name: 'Confirm password, then devices (any password continues)',
  render: () => (
    <AppContext.Provider
      value={mockAppContext({
        account,
        authClient: mockDeleteSyncDataAuthClient(),
      })}
    >
      <MfaContext.Provider value="sync_data">
        <PageDeleteSyncData syncCapableDevices={MOCK_SYNC_DEVICES} />
      </MfaContext.Provider>
    </AppContext.Provider>
  ),
};
