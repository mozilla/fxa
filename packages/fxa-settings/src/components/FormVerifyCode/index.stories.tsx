/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import FormVerifyCode from '.';
import AppLayout from '../../components/AppLayout';
import { Meta } from '@storybook/react';
import { Subject } from './mocks';

export default {
  title: 'components/FormVerifyCode',
  component: FormVerifyCode,
} as Meta;

export const Default = () => (
  <AppLayout>
    <Subject />
  </AppLayout>
);
