/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import SigninTotpCode from '.';
import { Meta } from '@storybook/react';
import { LocationProvider } from '@reach/router';
import { MozServices } from '../../../lib/types';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import {
  mockOAuthNativeSigninIntegration,
  mockWebSigninIntegration,
  Subject,
  MOCK_TOTP_LOCATION_STATE,
} from './mocks';
import { BeginSigninError } from '../../../lib/error-utils';
import { SigninIntegration, SigninLocationState } from '../interfaces';
import { MOCK_CMS_INFO } from '../../mocks';

export default {
  title: 'Pages/Signin/SigninTotpCode',
  component: SigninTotpCode,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = (props: {
  submitTotpCode: () => Promise<{ error?: BeginSigninError }>;
  serviceName: MozServices;
  integration?: SigninIntegration;
  signinState?: SigninLocationState;
}) => {
  const story = () => (
    <LocationProvider>
      <Subject {...props} />
    </LocationProvider>
  );
  return story;
};

export const Default = storyWithProps({
  submitTotpCode: async () => ({}),
  serviceName: MozServices.Default,
  integration: mockWebSigninIntegration,
});

export const RedirectFromSettingsBecauseAALUpgradeNeeded = storyWithProps({
  submitTotpCode: async () => ({}),
  serviceName: MozServices.Default,
  integration: mockWebSigninIntegration,
  signinState: { ...MOCK_TOTP_LOCATION_STATE, isSessionAALUpgrade: true },
});

export const WithOAuthDesktopServiceRelay = storyWithProps({
  submitTotpCode: async () => ({}),
  serviceName: MozServices.FirefoxSync,
  integration: mockOAuthNativeSigninIntegration(false),
});

export const WithIncorrectCode = storyWithProps({
  submitTotpCode: async () => ({
    error: AuthUiErrors.INVALID_TOTP_CODE as BeginSigninError,
  }),
  serviceName: MozServices.MozillaVPN,
  integration: mockWebSigninIntegration,
});

export const WithUnexpectedError = storyWithProps({
  submitTotpCode: async () => ({
    error: AuthUiErrors.UNEXPECTED_ERROR as BeginSigninError,
  }),
  serviceName: MozServices.MozillaVPN,
  integration: mockWebSigninIntegration,
});

export const DefaultWithCms = storyWithProps({
  submitTotpCode: async () => ({}),
  serviceName: MozServices.Default,
  integration: mockOAuthNativeSigninIntegration(true, MOCK_CMS_INFO),
});
