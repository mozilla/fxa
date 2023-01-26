/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import SigninTokenCode from '.';
import AppLayout from '../../../components/AppLayout';
import { Meta } from '@storybook/react';
import { MOCK_EMAIL } from './mocks';

export default {
  title: 'pages/Signin/SigninTokenCode',
  component: SigninTokenCode,
} as Meta;

export const Default = () => (
  <AppLayout>
    <SigninTokenCode email={MOCK_EMAIL} />
  </AppLayout>
);
