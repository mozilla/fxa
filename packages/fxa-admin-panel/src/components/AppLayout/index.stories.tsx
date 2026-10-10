/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import AppLayout from './index';

const meta: Meta<typeof AppLayout> = {
  title: 'Components/AppLayout',
  component: AppLayout,
};

export default meta;
type Story = StoryObj<typeof AppLayout>;

export const Default: Story = {
  args: { children: <p>Page content</p> },
};
