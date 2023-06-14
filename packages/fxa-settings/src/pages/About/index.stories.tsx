/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import About from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from '../../../.storybook/decorators';

export default {
  title: 'Pages/About',
  component: About,
  decorators: [withLocalization],
} as Meta;

export const Basic = () => (
  <About/>
);