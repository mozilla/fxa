/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { action } from '@storybook/addon-actions';
import { Meta } from '@storybook/react';

import { withLocalization, withLocation } from 'fxa-react/lib/storybooks';
import { FlowSetup2faApp } from '.';
import {
  MOCK_2FA_SECRET_KEY_RAW,
  PLACEHOLDER_QR_CODE,
} from '../../../pages/mocks';
import SettingsLayout from '../SettingsLayout';
import { TwoStepSetupMethod } from './types';

export default {
  title: 'Components/Settings/FlowSetup2faApp',
  component: FlowSetup2faApp,
  decorators: [
    withLocalization,
    withLocation('/settings/two_step_authentication'),
  ],
} as Meta;

const verifyCodeSuccess = async (code: string) => {
  action('verifyCode')(code);
  return {};
};

const verifyCodeFailure = async (code: string) => {
  return { error: true };
};

const navigateBackward = async () => {
  action('navigateBackward')();
};

const dummyTotpInfo = {
  // placeholder fake image for storybook
  qrCodeUrl: PLACEHOLDER_QR_CODE,
  secret: MOCK_2FA_SECRET_KEY_RAW,
};

const defaultProps = {
  localizedPageTitle: 'Two-step authentication',
  totpInfo: dummyTotpInfo,
  onBackButtonClick: navigateBackward,
  currentStep: 1,
  numberOfSteps: 3,
};

export const NoProgressBar = () => (
  <SettingsLayout>
    <FlowSetup2faApp verifyCode={verifyCodeSuccess} {...defaultProps} />
  </SettingsLayout>
);

export const QrCodeSuccess = () => (
  <SettingsLayout>
    <FlowSetup2faApp
      showProgressBar
      initialSetupMethod={TwoStepSetupMethod.QrCode}
      verifyCode={verifyCodeSuccess}
      {...defaultProps}
    />
  </SettingsLayout>
);

export const QrCodeError = () => (
  <SettingsLayout>
    <FlowSetup2faApp
      showProgressBar
      initialSetupMethod={TwoStepSetupMethod.QrCode}
      verifyCode={verifyCodeFailure}
      {...defaultProps}
    />
  </SettingsLayout>
);

export const ManualCodeSuccess = () => (
  <SettingsLayout>
    <FlowSetup2faApp
      showProgressBar
      initialSetupMethod={TwoStepSetupMethod.ManualCode}
      verifyCode={verifyCodeSuccess}
      {...defaultProps}
    />
  </SettingsLayout>
);

export const ManualCodeError = () => (
  <SettingsLayout>
    <FlowSetup2faApp
      showProgressBar
      initialSetupMethod={TwoStepSetupMethod.ManualCode}
      verifyCode={verifyCodeFailure}
      {...defaultProps}
    />
  </SettingsLayout>
);
