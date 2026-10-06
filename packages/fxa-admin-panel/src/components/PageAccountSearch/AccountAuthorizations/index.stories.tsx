/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import { AccountAuthorizations } from './index';
import { mockAccount } from '../Account/mocks';

const meta: Meta<typeof AccountAuthorizations> = {
  title: 'Components/AccountAuthorizations',
  component: AccountAuthorizations,
};

export default meta;
type Story = StoryObj<typeof AccountAuthorizations>;

export const Default: Story = {
  args: { authorizations: mockAccount.accountAuthorizations },
};

export const None: Story = { args: { authorizations: [] } };
