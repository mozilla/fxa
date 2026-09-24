/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import PageAccountDelete from './index';
import type { AccountDeleteResponse } from 'fxa-admin-server/src/types';
import { mockDeleteResults, mockTaskStatuses } from './mocks';
import { stubAdminApi, stubAdminApiErrors } from '../../lib/storybook';

const meta: Meta<typeof PageAccountDelete> = {
  title: 'Components/PageAccountDelete',
  component: PageAccountDelete,
  tags: ['!autodocs'],
};

export default meta;
type Story = StoryObj<typeof PageAccountDelete>;

const stubs = {
  deleteAccounts: async () => mockDeleteResults as AccountDeleteResponse[],
  getDeleteStatus: async () => mockTaskStatuses,
};

export const Default: Story = { loaders: [stubAdminApi(stubs)] };

export const Error: Story = { loaders: [stubAdminApiErrors(stubs)] };
