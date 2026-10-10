/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import ErrorAlert from './index';
import { NETWORK_ERROR, REST_API_ERROR } from './mocks';

const meta: Meta<typeof ErrorAlert> = {
  title: 'Components/ErrorAlert',
  component: ErrorAlert,
};

export default meta;
type Story = StoryObj<typeof ErrorAlert>;

export const Default: Story = { args: { error: REST_API_ERROR } };

export const NetworkError: Story = { args: { error: NETWORK_ERROR } };
