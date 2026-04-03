/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CardLoadingSpinner } from './';
import { SpinnerType } from 'fxa-react/components/LoadingSpinner';
import AppLocalizationProvider from 'fxa-react/lib/AppLocalizationProvider';

const meta: Meta<typeof CardLoadingSpinner> = {
  title: 'Components/CardLoadingSpinner',
  component: CardLoadingSpinner,
  decorators: [
    (Story) => (
      <AppLocalizationProvider baseDir="." userLocales={navigator.languages}>
        <Story />
      </AppLocalizationProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CardLoadingSpinner>;

export const Default: Story = {
  render: () => (
    <div className="min-h-screen bg-grey-20 flex items-center justify-center">
      <CardLoadingSpinner />
    </div>
  ),
};

export const WhiteSpinnerOnDarkBackground: Story = {
  name: 'white spinner on dark background',
  render: () => (
    <div className="min-h-screen bg-grey-700 flex items-center justify-center">
      <CardLoadingSpinner spinnerType={SpinnerType.White} />
    </div>
  ),
};

export const LargeSpinner: Story = {
  name: 'large spinner',
  render: () => (
    <div className="min-h-screen bg-grey-20 flex items-center justify-center">
      <CardLoadingSpinner spinnerSize="w-16 h-16" />
    </div>
  ),
};

export const WithCmsBackgroundSimulation: Story = {
  name: 'with CMS background simulation',
  render: () => (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <CardLoadingSpinner />
    </div>
  ),
};
