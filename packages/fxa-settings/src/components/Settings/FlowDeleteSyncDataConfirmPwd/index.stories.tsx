/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withLocalization, withLocation } from 'fxa-react/lib/storybooks';
import AuthClient from 'fxa-auth-client/browser';
import { FlowDeleteSyncDataConfirmPwd } from '.';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';
import SettingsLayout from '../SettingsLayout';
import { mockDeleteSyncDataAuthClient } from './mocks';

export default {
  title: 'Components/Settings/FlowDeleteSyncDataConfirmPwd',
  component: FlowDeleteSyncDataConfirmPwd,
  decorators: [withLocalization, withLocation('/settings/delete_sync_data')],
} as Meta;

type Story = StoryObj<typeof FlowDeleteSyncDataConfirmPwd>;

const storyWithContext =
  (authClient: AuthClient = mockDeleteSyncDataAuthClient()) =>
  () => (
    <AppContext.Provider value={mockAppContext({ authClient })}>
      <SettingsLayout>
        <FlowDeleteSyncDataConfirmPwd
          localizedBackButtonTitle="Back to settings"
          localizedPageTitle="Delete synced data"
          navigateBackward={action('navigateBackward')}
          navigateForward={action('navigateForward')}
        />
      </SettingsLayout>
    </AppContext.Provider>
  );

export const Default: Story = {
  name: 'Any password continues',
  render: storyWithContext(),
};

export const IncorrectPassword: Story = {
  name: 'Incorrect password',
  render: storyWithContext(
    mockDeleteSyncDataAuthClient(AuthUiErrors.INCORRECT_PASSWORD)
  ),
};

export const Throttled: Story = {
  render: storyWithContext(
    mockDeleteSyncDataAuthClient({
      ...AuthUiErrors.THROTTLED,
      retryAfterLocalized: '15 minutes',
    })
  ),
};
