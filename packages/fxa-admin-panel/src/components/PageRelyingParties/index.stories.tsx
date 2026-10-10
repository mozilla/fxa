/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import PageRelyingParties from './index';
import { MOCK_RP_ALL_FIELDS, MOCK_RP_FALSY_FIELDS } from './mocks';
import { mockWafTokens } from '../PageWafTokens/mocks';
import { stubAdminApi, stubAdminApiErrors } from '../../lib/storybook';

const meta: Meta<typeof PageRelyingParties> = {
  title: 'Components/PageRelyingParties',
  component: PageRelyingParties,
  tags: ['!autodocs'],
};

export default meta;
type Story = StoryObj<typeof PageRelyingParties>;

const stubs = {
  getRelyingParties: async () => [MOCK_RP_ALL_FIELDS, MOCK_RP_FALSY_FIELDS],
  getWafTokens: async () => mockWafTokens,
  createRelyingParty: async () => ({ id: 'new-rp', secret: 'fake-secret' }),
  updateRelyingParty: async () => true,
  rotateRelyingPartySecret: async () => ({ secret: 'fake-secret' }),
  deletePreviousRelyingPartySecret: async () => true,
  deleteRelyingParty: async () => true,
};

export const Default: Story = { loaders: [stubAdminApi(stubs)] };

export const Error: Story = { loaders: [stubAdminApiErrors(stubs)] };
