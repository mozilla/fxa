/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import PageEmailBlocklist from './index';
import { mockEmailBlocklist } from './mocks';
import { stubAdminApi, stubAdminApiErrors } from '../../lib/storybook';

const meta: Meta<typeof PageEmailBlocklist> = {
  title: 'Components/PageEmailBlocklist',
  component: PageEmailBlocklist,
  tags: ['!autodocs'],
};

export default meta;
type Story = StoryObj<typeof PageEmailBlocklist>;

const stubs = {
  getEmailBlocklist: async () => mockEmailBlocklist,
  addEmailBlocklistEntries: async () => ({ ok: true }),
  disableEmailBlocklistMatches: async () => ({
    id: '5f0c5f0e-6b0f-4a7e-9d59-2f4f8f5b9c11',
    status: 'done' as const,
    scanned: 1000,
    total: 1000,
    disabled: 2,
    errors: 0,
  }),
  removeEmailBlocklistEntry: async () => ({ removed: true }),
  deleteAllEmailBlocklistEntries: async () => ({ ok: true }),
};

export const Default: Story = { loaders: [stubAdminApi(stubs)] };

export const Error: Story = { loaders: [stubAdminApiErrors(stubs)] };
