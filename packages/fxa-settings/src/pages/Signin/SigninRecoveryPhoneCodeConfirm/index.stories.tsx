/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import ConfirmRecoveryCode from '.';
import { Subject } from './mocks';

export default {
  title: 'Pages/Signin/SigninRecoveryMethod/Phone/ConfirmRecoveryCode',
  component: ConfirmRecoveryCode,
  decorators: [withLocalization],
} as Meta;

export const Basic = () => <Subject />;

export const WithErrorMessage = () => (
  <ConfirmRecoveryCode
    errorMessage="An error occurred. Please try again."
    maskedPhoneNumber="••••••1234"
    verifyCode={() => Promise.resolve()}
    resendCode={() => Promise.resolve()}
    clearBanners={() => {}}
    setErrorMessage={() => {}}
  />
);
