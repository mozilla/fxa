/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import Subscription from './index';
import { mockAccount } from '../Account/mocks';

const meta: Meta<typeof Subscription> = {
  title: 'Components/Subscription',
  component: Subscription,
};

export default meta;
type Story = StoryObj<typeof Subscription>;

export const Default: Story = { args: mockAccount.subscriptions[0] };
