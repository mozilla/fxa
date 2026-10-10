/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import PageOAuthScopes from './index';
import { mockOAuthScopes } from './mocks';
import { stubAdminApi, stubAdminApiErrors } from '../../lib/storybook';

const meta: Meta<typeof PageOAuthScopes> = {
  title: 'Components/PageOAuthScopes',
  component: PageOAuthScopes,
  tags: ['!autodocs'],
};

export default meta;
type Story = StoryObj<typeof PageOAuthScopes>;

const stubs = {
  getOAuthScopes: async () => mockOAuthScopes,
  createOAuthScope: async () => mockOAuthScopes[0],
};

export const Default: Story = { loaders: [stubAdminApi(stubs)] };

export const Error: Story = { loaders: [stubAdminApiErrors(stubs)] };
