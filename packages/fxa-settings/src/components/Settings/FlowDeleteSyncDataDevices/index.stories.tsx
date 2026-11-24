/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withLocalization, withLocation } from 'fxa-react/lib/storybooks';
import { FlowDeleteSyncDataDevices, SyncDevice } from '.';
import { AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';
import SettingsLayout from '../SettingsLayout';
import {
  MOCK_MANY_SYNC_DEVICES,
  MOCK_SYNC_DEVICES,
} from '../DataCollection/mocks';

export default {
  title: 'Components/Settings/FlowDeleteSyncDataDevices',
  component: FlowDeleteSyncDataDevices,
  decorators: [withLocalization, withLocation('/settings/delete_sync_data')],
} as Meta;

type Story = StoryObj<typeof FlowDeleteSyncDataDevices>;

const storyWithDevices = (devices: SyncDevice[]) => () => (
  <AppContext.Provider value={mockAppContext()}>
    <SettingsLayout>
      <FlowDeleteSyncDataDevices
        {...{ devices }}
        localizedBackButtonTitle="Back to settings"
        localizedPageTitle="Delete synced data"
        navigateBackward={action('navigateBackward')}
        onCancel={action('onCancel')}
        onConfirm={action('onConfirm')}
      />
    </SettingsLayout>
  </AppContext.Provider>
);

export const ThreeDevices: Story = {
  name: 'With 3 devices',
  render: storyWithDevices(MOCK_SYNC_DEVICES),
};

export const OneDevice: Story = {
  name: 'With 1 device',
  render: storyWithDevices(MOCK_SYNC_DEVICES.slice(0, 1)),
};

export const ManyDevices: Story = {
  name: 'With 12 devices',
  render: storyWithDevices(MOCK_MANY_SYNC_DEVICES),
};
