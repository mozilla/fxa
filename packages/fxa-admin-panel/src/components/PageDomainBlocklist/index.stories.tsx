/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import PageDomainBlocklist from './index';
import { mockDomainBlocklist } from './mocks';
import { stubAdminApi, stubAdminApiErrors } from '../../lib/storybook';

const meta: Meta<typeof PageDomainBlocklist> = {
  title: 'Components/PageDomainBlocklist',
  component: PageDomainBlocklist,
  tags: ['!autodocs'],
};

export default meta;
type Story = StoryObj<typeof PageDomainBlocklist>;

const stubs = {
  getDomainBlocklist: async () => mockDomainBlocklist,
  addDomainBlocklistEntries: async () => ({ ok: true }),
  disableDomainBlocklistMatches: async () => ({
    id: '5f0c5f0e-6b0f-4a7e-9d59-2f4f8f5b9c11',
    status: 'done' as const,
    scanned: 1000,
    total: 1000,
    disabled: 2,
    errors: 0,
  }),
  removeDomainBlocklistEntry: async () => ({ removed: true }),
  deleteAllDomainBlocklistEntries: async () => ({ ok: true }),
  syncDomainBlocklist: async () => ({ ok: true, total: 2, submitted: 2 }),
};

export const Default: Story = { loaders: [stubAdminApi(stubs)] };

export const Error: Story = { loaders: [stubAdminApiErrors(stubs)] };

export const ManyEntries: Story = {
  loaders: [
    stubAdminApi({
      ...stubs,
      getDomainBlocklist: async () =>
        Array.from({ length: 1234 }, (_, i) => ({
          domain: `spam${i}.example.com`,
          createdAt: 1700000000000,
        })),
    }),
  ],
};
