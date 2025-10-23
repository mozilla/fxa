/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { action } from '@storybook/addon-actions';
import { Meta } from '@storybook/react';
import { withLocalization, withLocation } from 'fxa-react/lib/storybooks';
import FlowSetupRecoveryPhoneConfirmCode from '.';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { MOCK_NATIONAL_FORMAT_PHONE_NUMBER } from '../../../pages/mocks';
import SettingsLayout from '../SettingsLayout';

export default {
  title: 'Components/Settings/FlowSetupRecoveryPhoneConfirmCode',
  component: FlowSetupRecoveryPhoneConfirmCode,
  decorators: [
    withLocalization,
    withLocation('/settings/recovery_phone/setup'),
  ],
} as Meta;

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

const nationalFormatPhoneNumber = MOCK_NATIONAL_FORMAT_PHONE_NUMBER;

export const Success = () => (
  <SettingsLayout>
    <FlowSetupRecoveryPhoneConfirmCode
      {...{
        nationalFormatPhoneNumber,
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
        nationalFormatPhoneNumber,
        localizedPageTitle,
        navigateBackward,
        navigateForward,
      }}
      sendCode={resendCodeFailure}
      verifyRecoveryCode={verifyRecoveryCodeFailure}
    />
  </SettingsLayout>
);
