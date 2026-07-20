/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './index';
import { LogoLockup } from '../LogoLockup';
import AppLocalizationProvider from '../../lib/AppLocalizationProvider';

const meta: Meta<typeof Header> = {
  title: 'Components/Header',
  component: Header,
  decorators: [
    (Story) => (
      <AppLocalizationProvider baseDir="." userLocales={navigator.languages}>
        <Story />
      </AppLocalizationProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Basic: Story = {
  render: () => (
    <AppLocalizationProvider baseDir="." userLocales={navigator.languages}>
      <Header left={<div>left content</div>} right={<div>right content</div>} />
    </AppLocalizationProvider>
  ),
};

export const WithLogoLockup: Story = {
  name: 'with LogoLockup',
  render: () => (
    <AppLocalizationProvider baseDir="." userLocales={navigator.languages}>
      <Header
        left={<LogoLockup>Some title</LogoLockup>}
        right={<div>right content</div>}
      />
    </AppLocalizationProvider>
  ),
};
