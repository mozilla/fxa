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
  removeEmailBlocklistEntry: async () => ({ removed: true }),
  deleteAllEmailBlocklistEntries: async () => ({ ok: true }),
};

export const Default: Story = { loaders: [stubAdminApi(stubs)] };

export const Error: Story = { loaders: [stubAdminApiErrors(stubs)] };
