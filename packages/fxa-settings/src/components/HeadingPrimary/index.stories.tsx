/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { HeadingPrimary } from '.';

export default {
  title: 'Components/HeadingPrimary',
  component: HeadingPrimary,
} as Meta;

export const Default = <HeadingPrimary>Primary heading text</HeadingPrimary>;
