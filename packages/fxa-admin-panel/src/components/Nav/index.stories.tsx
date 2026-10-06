/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import Nav from './index';

const meta: Meta<typeof Nav> = {
  title: 'Components/Nav',
  component: Nav,
};

export default meta;
type Story = StoryObj<typeof Nav>;

export const Default: Story = {};
