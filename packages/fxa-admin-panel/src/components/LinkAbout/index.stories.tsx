/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import LinkAbout from './index';

const meta: Meta<typeof LinkAbout> = {
  title: 'Components/LinkAbout',
  component: LinkAbout,
};

export default meta;
type Story = StoryObj<typeof LinkAbout>;

// The link is white text, so it needs a dark background to be visible.
export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="bg-grey-900 p-4">
        <Story />
      </div>
    ),
  ],
};
