/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import AccountSearch from './index';
import { mockAccount } from './Account/mocks';
import {
  accountActionStubs,
  stubAdminApi,
  stubAdminApiErrors,
} from '../../lib/storybook';

const meta: Meta<typeof AccountSearch> = {
  title: 'Components/PageAccountSearch',
  component: AccountSearch,
  loaders: [stubAdminApi(accountActionStubs)],
  tags: ['!autodocs'],
};

export default meta;
type Story = StoryObj<typeof AccountSearch>;

const stubs = {
  getAccountByEmail: async () => mockAccount,
  getAccountByUid: async () => mockAccount,
  getAccountByPhone: async () => [mockAccount],
  getEmailsLike: async () => mockAccount.emails,
  getPhonesLike: async () => [{ phoneNumber: '+15555551234' }],
};

export const Default: Story = { loaders: [stubAdminApi(stubs)] };

export const Error: Story = { loaders: [stubAdminApiErrors(stubs)] };
