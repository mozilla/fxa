/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import PageWafTokens from './index';
import { mockWafTokens } from './mocks';
import { MOCK_RP_ALL_FIELDS } from '../PageRelyingParties/mocks';
import { stubAdminApi, stubAdminApiErrors } from '../../lib/storybook';

const meta: Meta<typeof PageWafTokens> = {
  title: 'Components/PageWafTokens',
  component: PageWafTokens,
  tags: ['!autodocs'],
};

export default meta;
type Story = StoryObj<typeof PageWafTokens>;

const stubs = {
  getWafTokens: async () => mockWafTokens,
  getRelyingParties: async () => [MOCK_RP_ALL_FIELDS],
  createWafToken: async () => mockWafTokens[0],
  rotateWafToken: async () => mockWafTokens[0],
  deleteWafToken: async () => true,
};

export const Default: Story = { loaders: [stubAdminApi(stubs)] };

export const Error: Story = { loaders: [stubAdminApiErrors(stubs)] };
