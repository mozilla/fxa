/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import LoadingSpinner, { SpinnerType } from './index';
import AppLocalizationProvider from '../../lib/AppLocalizationProvider';

const meta: Meta<typeof LoadingSpinner> = {
  title: 'Components/LoadingSpinner',
  component: LoadingSpinner,
  decorators: [
    (Story) => (
      <AppLocalizationProvider baseDir="." userLocales={navigator.languages}>
        <Story />
      </AppLocalizationProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {};

export const Blue: Story = {
  args: {
    spinnerType: SpinnerType.Blue,
  },
};

export const White: Story = {
  render: () => (
    <AppLocalizationProvider baseDir="." userLocales={navigator.languages}>
      <div className="bg-grey-700">
        <LoadingSpinner spinnerType={SpinnerType.White} />
      </div>
    </AppLocalizationProvider>
  ),
};
