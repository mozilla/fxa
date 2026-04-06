/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import LinkExternal from './index';
import AppLocalizationProvider from '../../lib/AppLocalizationProvider';

const meta: Meta<typeof LinkExternal> = {
  title: 'Components/LinkExternal',
  component: LinkExternal,
  decorators: [
    (Story) => (
      <AppLocalizationProvider baseDir="." userLocales={navigator.languages}>
        <Story />
      </AppLocalizationProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LinkExternal>;

export const Basic: Story = {
  render: () => (
    <AppLocalizationProvider baseDir="." userLocales={navigator.languages}>
      <LinkExternal href="https://mozilla.org">
        Keep the internet open and accessible to all.
      </LinkExternal>
    </AppLocalizationProvider>
  ),
};
