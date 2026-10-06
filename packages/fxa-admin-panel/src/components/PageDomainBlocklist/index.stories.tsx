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
  removeDomainBlocklistEntry: async () => ({ removed: true }),
  deleteAllDomainBlocklistEntries: async () => ({ ok: true }),
  syncDomainBlocklist: async () => ({ ok: true, total: 2, submitted: 2 }),
};

export const Default: Story = { loaders: [stubAdminApi(stubs)] };

export const Error: Story = { loaders: [stubAdminApiErrors(stubs)] };
