/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TableRowXHeader, TableXHeaders } from './index';

const meta: Meta<typeof TableXHeaders> = {
  title: 'Components/TableXHeaders',
  component: TableXHeaders,
};

export default meta;
type Story = StoryObj<typeof TableXHeaders>;

export const Default: Story = {
  args: {
    header: 'Emails',
    rowHeaders: ['Email', 'Verified'],
    children: [
      <TableRowXHeader key="1">
        <>user@example.com</>
        <>Yes</>
      </TableRowXHeader>,
      <TableRowXHeader key="2">
        <>user2@example.com</>
        <>No</>
      </TableRowXHeader>,
    ],
  },
};
