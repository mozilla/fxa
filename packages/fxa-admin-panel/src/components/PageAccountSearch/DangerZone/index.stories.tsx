/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import DangerZone from './index';
import { mockAccount } from '../Account/mocks';
import { accountActionStubs, stubAdminApi } from '../../../lib/storybook';

const meta: Meta<typeof DangerZone> = {
  title: 'Components/DangerZone',
  component: DangerZone,
  loaders: [stubAdminApi(accountActionStubs)],
};

export default meta;
type Story = StoryObj<typeof DangerZone>;

export const Default: Story = {
  args: {
    uid: mockAccount.uid,
    email: mockAccount.emails[0],
    disabledAt: null,
    onCleared: () => {},
    has2FA: true,
    hasRecoveryPhone: true,
    hasPasskeys: true,
  },
};
