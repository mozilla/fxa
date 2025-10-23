/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { action } from '@storybook/addon-actions';
import { Meta } from '@storybook/react';
import { withLocalization, withLocation } from 'fxa-react/lib/storybooks';
import FlowSetupRecoveryPhoneSubmitNumber from '.';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { RecoveryPhoneSetupReason } from '../../../lib/types';
import SettingsLayout from '../SettingsLayout';

export default {
  title: 'Components/Settings/FlowSetupRecoveryPhoneSubmitNumber',
  component: FlowSetupRecoveryPhoneSubmitNumber,
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

const verifyNumberSuccess = async (phoneNumber: string) => {
  action('verifyPhoneNumber')(phoneNumber);
};

const verifyNumberFailure = async (phoneNumber: string) => {
  return Promise.reject(AuthUiErrors.UNEXPECTED_ERROR);
};

export const ChangePhone = () => (
  <SettingsLayout>
    <FlowSetupRecoveryPhoneSubmitNumber
      {...{
        localizedPageTitle,
        navigateBackward,
        navigateForward,
      }}
      reason={RecoveryPhoneSetupReason.change}
      verifyPhoneNumber={verifyNumberSuccess}
    />
  </SettingsLayout>
);

export const Success = () => (
  <SettingsLayout>
    <FlowSetupRecoveryPhoneSubmitNumber
      {...{
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
        localizedPageTitle,
        navigateBackward,
        navigateForward,
      }}
      verifyPhoneNumber={verifyNumberFailure}
    />
  </SettingsLayout>
);
