/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import ResultBoolean from './index';

const meta: Meta<typeof ResultBoolean> = {
  title: 'Components/ResultBoolean',
  component: ResultBoolean,
};

export default meta;
type Story = StoryObj<typeof ResultBoolean>;

export const True: Story = { args: { isTruthy: true } };

export const False: Story = { args: { isTruthy: false } };

export const Unformatted: Story = { args: { isTruthy: true, format: false } };
