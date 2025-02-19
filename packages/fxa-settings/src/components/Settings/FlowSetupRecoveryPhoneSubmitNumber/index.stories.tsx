/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import SettingsLayout from '../SettingsLayout';
import { action } from '@storybook/addon-actions';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import FlowSetupRecoveryPhoneSubmitNumber from '.';

export default {
  title: 'Components/Settings/FlowSetupRecoveryPhoneSubmitNumber',
  component: FlowSetupRecoveryPhoneSubmitNumber,
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

const verifyNumberSuccess = async (phoneNumber: string) => {
  action('verifyPhoneNumber')(phoneNumber);
};

const verifyNumberFailure = async (phoneNumber: string) => {
  return Promise.reject(AuthUiErrors.UNEXPECTED_ERROR);
};

const phoneRegistrationLimitReached = async (phoneNumber: string) => {
  return Promise.reject(AuthUiErrors.RECOVERY_PHONE_REGISTRATION_LIMIT_REACHED);
};

export const Success = () => (
  <SettingsLayout>
    <FlowSetupRecoveryPhoneSubmitNumber
      {...{
        localizedBackButtonTitle,
        localizedPageTitle,
        navigateBackward,
        navigateForward,
      }}
      verifyPhoneNumber={verifyNumberSuccess}
    />
  </SettingsLayout>
);

export const Error = () => (
  <SettingsLayout>
    <FlowSetupRecoveryPhoneSubmitNumber
      {...{
        localizedBackButtonTitle,
        localizedPageTitle,
        navigateBackward,
        navigateForward,
      }}
      verifyPhoneNumber={verifyNumberFailure}
    />
  </SettingsLayout>
);
