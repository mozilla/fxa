/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ConfirmSignupCode from '.';
import AppLayout from '../../../components/AppLayout';
import { Meta } from '@storybook/react';
import { MOCK_EMAIL } from './mocks';

export default {
  title: 'pages/Signup/ConfirmSignupCode',
  component: ConfirmSignupCode,
} as Meta;

export const Default = () => (
  <AppLayout>
    <ConfirmSignupCode email={MOCK_EMAIL} />
  </AppLayout>
);
