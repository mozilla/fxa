/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withLocalization, withLocation } from 'fxa-react/lib/storybooks';
import AuthClient from 'fxa-auth-client/browser';
import { PageDeleteSyncData, PageDeleteSyncDataProps } from '.';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';
import {
  MOCK_MANY_SYNC_DEVICES,
  MOCK_SYNC_DEVICES,
} from '../DataCollection/mocks';
import { mockDeleteSyncDataAuthClient } from './mocks';

export default {
  title: 'Pages/Settings/DeleteSyncData',
  component: PageDeleteSyncData,
  decorators: [withLocalization, withLocation('/settings/delete_sync_data')],
} as Meta;

type Story = StoryObj<typeof PageDeleteSyncData>;

const storyWithContext = (
  props: PageDeleteSyncDataProps,
  authClient: AuthClient = mockDeleteSyncDataAuthClient()
) => {
  const story = () => (
    <AppContext.Provider value={mockAppContext({ authClient })}>
      <PageDeleteSyncData onConfirm={action('onConfirm')} {...props} />
    </AppContext.Provider>
  );
  return story;
};

export const ConfirmPassword: Story = {
  name: 'Step 1: confirm password (any password continues)',
  render: storyWithContext({ syncCapableDevices: MOCK_SYNC_DEVICES }),
};

export const ConfirmPasswordIncorrect: Story = {
  name: 'Step 1: confirm password, incorrect password',
  render: storyWithContext(
    { syncCapableDevices: MOCK_SYNC_DEVICES },
    mockDeleteSyncDataAuthClient(AuthUiErrors.INCORRECT_PASSWORD)
  ),
};

export const ConfirmPasswordThrottled: Story = {
  name: 'Step 1: confirm password, throttled',
  render: storyWithContext(
    { syncCapableDevices: MOCK_SYNC_DEVICES },
    mockDeleteSyncDataAuthClient({
      ...AuthUiErrors.THROTTLED,
      retryAfterLocalized: '15 minutes',
    })
  ),
};

export const Devices: Story = {
  name: 'Step 2: devices, with 3 devices',
  render: storyWithContext({
    syncCapableDevices: MOCK_SYNC_DEVICES,
    initialStep: 2,
  }),
};

export const DevicesOneDevice: Story = {
  name: 'Step 2: devices, with 1 device',
  render: storyWithContext({
    syncCapableDevices: MOCK_SYNC_DEVICES.slice(0, 1),
    initialStep: 2,
  }),
};

export const DevicesManyDevices: Story = {
  name: 'Step 2: devices, with 12 devices',
  render: storyWithContext({
    syncCapableDevices: MOCK_MANY_SYNC_DEVICES,
    initialStep: 2,
  }),
};
