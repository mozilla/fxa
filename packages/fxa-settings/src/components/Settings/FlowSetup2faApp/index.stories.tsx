/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { withLocalization } from 'fxa-react/lib/storybooks';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { MOCK_2FA_SECRET_KEY_RAW } from '../../../pages/mocks';
import SettingsLayout from '../SettingsLayout';
import { FlowSetup2faApp } from '.';
import { TwoStepSetupMethod } from './types';

export default {
  title: 'Components/Settings/FlowSetup2faApp',
  component: FlowSetup2faApp,
  decorators: [withLocalization],
} as Meta;

const verifyCodeSuccess = async (code: string) => {
  action('verifyCode')(code);
};

const verifyCodeFailure = async (code: string) => {
  return Promise.reject(AuthUiErrors.UNEXPECTED_ERROR);
};

const navigateBackward = async () => {
  action('navigateBackward')();
};

const dummyTotpInfo = {
  // figure out a mock here
  qrCodeUrl: 'https://placehold.co/192x192/white/black?text=QR+Code&font=poppins',
  secret: MOCK_2FA_SECRET_KEY_RAW,
};

const defaultProps = {
  localizedFlowTitle: 'Two-step authentication',
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
