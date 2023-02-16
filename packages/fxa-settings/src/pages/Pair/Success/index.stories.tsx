/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import PairSuccess from '.';
import { Meta } from '@storybook/react';
import AppLayout from '../../../components/AppLayout';
import { MOCK_ERROR } from './mocks';
import { withLocalization } from '../../../../.storybook/decorators';

export default {
  title: 'Pages/Pair/Success',
  component: PairSuccess,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <AppLayout>
    <PairSuccess />
  </AppLayout>
);

export const WithError = () => (
  <AppLayout>
    <PairSuccess error={MOCK_ERROR} />
  </AppLayout>
);
