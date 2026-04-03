/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import tailwindConfig from '../../../fxa-react/configs/tailwind';
import resolveConfig from 'tailwindcss/resolveConfig';
import IntroductionPage from './pages/Introduction';
import ColorsPage from './pages/Colors';
import TypographyPage from './pages/Typography';
import SpacingPage from './pages/Spacing';
import BreakpointsPage from './pages/Breakpoints';

const fullConfig = resolveConfig(tailwindConfig);

// these have an emoji in front so they appear at the top of the alphabetical sort
const meta: Meta = {
  title: '✩Design Guide',
};

export default meta;
type Story = StoryObj;

export const Introduction: Story = {
  render: () => <IntroductionPage />,
};

export const Colors: Story = {
  render: () => <ColorsPage config={fullConfig} />,
};

export const Typography: Story = {
  render: () => <TypographyPage config={fullConfig} />,
};

export const Spacing: Story = {
  render: () => <SpacingPage config={fullConfig} />,
};

export const Breakpoints: Story = {
  render: () => <BreakpointsPage config={fullConfig} />,
};
