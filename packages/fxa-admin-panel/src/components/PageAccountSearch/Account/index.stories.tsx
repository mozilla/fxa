/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import Account from './index';
import { mockAccount } from './mocks';
import { accountActionStubs, stubAdminApi } from '../../../lib/storybook';

const meta: Meta<typeof Account> = {
  title: 'Components/Account',
  component: Account,
  loaders: [stubAdminApi(accountActionStubs)],
};

export default meta;
type Story = StoryObj<typeof Account>;

export const Default: Story = {
  args: { ...mockAccount, query: mockAccount.email, onCleared: () => {} },
};
