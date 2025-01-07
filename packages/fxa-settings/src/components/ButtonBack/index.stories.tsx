/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import AppLayout from '../AppLayout';
import ButtonBack from '.';
import { HeadingPrimary } from '../HeadingPrimary';

export default {
  title: 'components/ButtonBack',
  component: ButtonBack,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <AppLayout>
    <div className="relative flex items-start">
      <ButtonBack />
      <HeadingPrimary>Our primary header</HeadingPrimary>
    </div>
  </AppLayout>
);
