/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import AppErrorDialog from './index';
import AppLocalizationProvider from '../../lib/AppLocalizationProvider';

const meta: Meta<typeof AppErrorDialog> = {
  title: 'Components/AppErrorDialog',
  component: AppErrorDialog,
  decorators: [
    (Story) => (
      <AppLocalizationProvider baseDir="." userLocales={navigator.languages}>
        <Story />
      </AppLocalizationProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AppErrorDialog>;

export const Basic: Story = {};

export const GeneralWithErrors: Story = {
  name: 'general with errors',
  args: {
    errorType: 'general',
  },
};

export const InvalidQueryParameters: Story = {
  name: 'invalid query parameters',
  args: {
    errorType: 'query-parameter-violation',
  },
};
