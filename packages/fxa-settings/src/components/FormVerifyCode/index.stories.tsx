/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import FormVerifyCode from '.';
import AppLayout from '../../components/AppLayout';
import { Meta } from '@storybook/react';
import { Subject } from './mocks';
import { withLocalization } from '../../../.storybook/decorators';

export default {
  title: 'Components/FormVerifyCode',
  component: FormVerifyCode,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <AppLayout>
    <Subject />
  </AppLayout>
);
