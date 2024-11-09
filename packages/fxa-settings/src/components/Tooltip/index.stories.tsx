/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import Tooltip from './index';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Components/Tooltip',
  component: Tooltip,
  decorators: [
    withLocalization,
    (Story: StoryObj) => (
      <div className="flex flex-col items-center p-20 max-w-md">
        <div className="relative p-2 bg-grey-100">
          <Story />
        </div>
      </div>
    ),
  ],
} as Meta;

export const Default = () => (
  <>
    <p>Default tooltip pointing to this text</p>
    <Tooltip message="My tooltip message here" />
  </>
);
export const Bottom = () => (
  <>
    <p>Default tooltip pointing to this text</p>
    <Tooltip message="My tooltip message here" position="bottom" />
  </>
);
export const BottomAnchoredStart = () => (
  <>
    <p>Default tooltip pointing to this text</p>
    <Tooltip
      message="My tooltip message here"
      position="bottom"
      anchorPosition="start"
    />
  </>
);
export const Error = () => (
  <>
    <p>Error tooltip pointing to this text</p>
    <Tooltip type="error" message="My tooltip message here" />
  </>
);
