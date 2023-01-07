/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Subject } from './mocks';
import AppLayout from '../AppLayout';
import FormResetPasswordWithBalloon from '.';
import { Meta } from '@storybook/react';

export default {
  title: 'Components/FormResetPasswordWithBalloon',
  component: FormResetPasswordWithBalloon,
} as Meta;

export const Default = () => (
  <AppLayout>
    <div className="max-w-lg mx-auto">
      <Subject />
    </div>
  </AppLayout>
);
