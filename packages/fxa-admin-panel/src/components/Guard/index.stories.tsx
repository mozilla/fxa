/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AdminPanelFeature } from '@fxa/shared/guards';
import Guard from './index';

const meta: Meta<typeof Guard> = {
  title: 'Components/Guard',
  component: Guard,
};

export default meta;
type Story = StoryObj<typeof Guard>;

export const Default: Story = {
  args: {
    features: [AdminPanelFeature.AccountSearch],
    children: <p>Only users with the AccountSearch feature see this.</p>,
  },
};
