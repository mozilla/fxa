/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import PageRateLimiting from './index';
import {
  mockBanStatusData,
  mockBlockStatusData1,
  mockBlockStatusData2,
} from './mocks';
import { stubAdminApi, stubAdminApiErrors } from '../../lib/storybook';

const meta: Meta<typeof PageRateLimiting> = {
  title: 'Components/PageRateLimiting',
  component: PageRateLimiting,
  tags: ['!autodocs'],
};

export default meta;
type Story = StoryObj<typeof PageRateLimiting>;

const stubs = {
  getRateLimits: async () => [
    mockBlockStatusData1,
    mockBlockStatusData2,
    mockBanStatusData,
  ],
  clearRateLimits: async () => 3,
};

export const Default: Story = { loaders: [stubAdminApi(stubs)] };

export const Error: Story = { loaders: [stubAdminApiErrors(stubs)] };
