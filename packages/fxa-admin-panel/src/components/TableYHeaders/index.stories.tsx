/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TableRowYHeader, TableYHeaders } from './index';

const meta: Meta<typeof TableYHeaders> = {
  title: 'Components/TableYHeaders',
  component: TableYHeaders,
};

export default meta;
type Story = StoryObj<typeof TableYHeaders>;

export const Default: Story = {
  args: {
    header: 'Account',
    children: [
      <TableRowYHeader key="1" header="Email" children="user@example.com" />,
      <TableRowYHeader key="2" header="Locale" children="en-US" />,
    ],
  },
};
