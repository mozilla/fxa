/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import SettingsLayout from '../SettingsLayout';
import { action } from '@storybook/addon-actions';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import FlowSetupRecoveryPhoneConfirmCode from '.';

export default {
  title: 'Components/Settings/FlowSetupRecoveryPhoneConfirmCode',
  component: FlowSetupRecoveryPhoneConfirmCode,
  decorators: [withLocalization],
} as Meta;

const localizedBackButtonTitle = 'Back';
const localizedPageTitle = 'Add recovery phone';

const navigateBackward = async () => {
  action('navigateBackward')();
};

const navigateForward = async () => {
  action('navigateForward')();
};

const resendCodeSuccess = async () => {
  action('resendCode')();
};

const resendCodeFailure = async () => {
  return Promise.reject(AuthUiErrors.THROTTLED);
};

const verifyRecoveryCodeSuccess = async (code: string) => {
  action('verifyRecoveryCode')(code);
};

const verifyRecoveryCodeFailure = async (code: string) => {
  return Promise.reject(AuthUiErrors.UNEXPECTED_ERROR);
};

const formattedPhoneNumber = '+1 123-456-3019';

export const Success = () => (
  <SettingsLayout>
    <FlowSetupRecoveryPhoneConfirmCode
      {...{
        formattedPhoneNumber,
        localizedBackButtonTitle,
        localizedPageTitle,
        navigateBackward,
        navigateForward,
      }}
      sendCode={resendCodeSuccess}
      verifyRecoveryCode={verifyRecoveryCodeSuccess}
    />
  </SettingsLayout>
);

export const Error = () => (
  <SettingsLayout>
    <FlowSetupRecoveryPhoneConfirmCode
      {...{
        formattedPhoneNumber,
        localizedBackButtonTitle,
        localizedPageTitle,
        navigateBackward,
        navigateForward,
      }}
      sendCode={resendCodeFailure}
      verifyRecoveryCode={verifyRecoveryCodeFailure}
    />
  </SettingsLayout>
);
