/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import SigninRecoveryCode from '.';
import AppLayout from '../../../components/AppLayout';
import { Meta } from '@storybook/react';
import { MOCK_ACCOUNT } from '../../../models/mocks';
import { MozServices } from '../../../lib/types';

export default {
  title: 'pages/Signin/SigninRecoveryCode',
  component: SigninRecoveryCode,
} as Meta;

export const Default = () => (
  <AppLayout>
    <SigninRecoveryCode email={MOCK_ACCOUNT.primaryEmail.email} />
  </AppLayout>
);

export const WithServiceName = () => (
  <AppLayout>
    <SigninRecoveryCode
      email={MOCK_ACCOUNT.primaryEmail.email}
      serviceName={MozServices.MozillaVPN}
    />
  </AppLayout>
);
