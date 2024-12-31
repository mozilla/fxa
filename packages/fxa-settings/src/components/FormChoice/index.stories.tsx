/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import FormChoice from '.';
import { withLocalization } from 'fxa-react/lib/storybooks';
import AppLayout from '../AppLayout';
import { commonFormChoiceProps } from './mocks';

export default {
  title: 'components/FormChoice',
  component: FormChoice,
  decorators: [withLocalization],
} as Meta;

export const DefaultLeftAlignedImages = () => (
  <AppLayout>
    <FormChoice {...commonFormChoiceProps} />
  </AppLayout>
);
export const RightAlignedImages = () => (
  <AppLayout>
    <FormChoice alignImage="end" {...commonFormChoiceProps} />
  </AppLayout>
);
