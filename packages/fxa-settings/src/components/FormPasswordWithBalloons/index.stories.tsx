/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Subject } from './mocks';
import AppLayout from '../AppLayout';
import FormPasswordWithBalloons from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from '../../../.storybook/decorators';

export default {
  title: 'Components/FormPasswordWithBalloons',
  component: FormPasswordWithBalloons,
  decorators: [withLocalization],
} as Meta;

export const ResetPassword = () => (
  <AppLayout>
    <div className="max-w-lg mx-auto">
      <Subject passwordFormType="reset" />
    </div>
  </AppLayout>
);

export const Signup = () => (
  <AppLayout>
    <div className="max-w-lg mx-auto">
      <Subject passwordFormType="signup" />
    </div>
  </AppLayout>
);
