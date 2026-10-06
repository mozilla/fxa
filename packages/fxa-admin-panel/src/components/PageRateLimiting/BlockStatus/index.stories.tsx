/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import { BlockStatus } from './index';
import { mockBanStatusData, mockBlockStatusData1 } from '../mocks';

const meta: Meta<typeof BlockStatus> = {
  title: 'Components/BlockStatus',
  component: BlockStatus,
};

export default meta;
type Story = StoryObj<typeof BlockStatus>;

export const Block: Story = { args: { status: mockBlockStatusData1 } };

export const Ban: Story = { args: { status: mockBanStatusData } };
