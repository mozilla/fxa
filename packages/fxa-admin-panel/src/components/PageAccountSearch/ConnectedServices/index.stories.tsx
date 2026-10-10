/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import { ConnectedServices } from './index';
import { mockAccount } from '../Account/mocks';

const meta: Meta<typeof ConnectedServices> = {
  title: 'Components/ConnectedServices',
  component: ConnectedServices,
};

export default meta;
type Story = StoryObj<typeof ConnectedServices>;

export const Default: Story = {
  args: { services: mockAccount.attachedClients },
};

export const None: Story = { args: { services: [] } };
