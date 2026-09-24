/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import PageAccountReset from './index';
import type { AccountResetResponse } from 'fxa-admin-server/src/types';
import { mockResetResults } from './mocks';
import { stubAdminApi, stubAdminApiErrors } from '../../lib/storybook';

const meta: Meta<typeof PageAccountReset> = {
  title: 'Components/PageAccountReset',
  component: PageAccountReset,
  tags: ['!autodocs'],
};

export default meta;
type Story = StoryObj<typeof PageAccountReset>;

const stubs = {
  resetAccounts: async () => mockResetResults as AccountResetResponse[],
};

export const Default: Story = { loaders: [stubAdminApi(stubs)] };

export const Error: Story = { loaders: [stubAdminApiErrors(stubs)] };
