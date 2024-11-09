/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import SigninRecoveryCode from '.';
import { Meta, StoryObj } from '@storybook/react';
import { MozServices } from '../../../lib/types';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { LocationProvider } from '@reach/router';
import { mockSigninLocationState } from '../mocks';
import { mockFinishOAuthFlowHandler } from '../../mocks';
import { mockWebIntegration } from './mocks';
import { BeginSigninError } from '../../../lib/error-utils';

export default {
  title: 'Pages/Signin/SigninRecoveryCode',
  component: SigninRecoveryCode,
  decorators: [
    withLocalization,
    (Story: StoryObj) => (
      <LocationProvider>
        <Story />
      </LocationProvider>
    ),
  ],
} as Meta;

const mockSubmitSuccess = () =>
  Promise.resolve({ data: { consumeRecoveryCode: { remaining: 3 } } });
const mockCodeError = () =>
  Promise.resolve({
    error: AuthUiErrors.INVALID_RECOVERY_CODE as BeginSigninError,
  });

const mockOtherError = () =>
  Promise.resolve({
    error: AuthUiErrors.UNEXPECTED_ERROR as BeginSigninError,
  });

export const Default = () => (
  <SigninRecoveryCode
    finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
    integration={mockWebIntegration}
    signinState={mockSigninLocationState}
    submitRecoveryCode={mockSubmitSuccess}
  />
);

export const WithServiceName = () => (
  <SigninRecoveryCode
    serviceName={MozServices.MozillaVPN}
    finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
    integration={mockWebIntegration}
    signinState={mockSigninLocationState}
    submitRecoveryCode={mockSubmitSuccess}
  />
);

export const WithCodeErrorOnSubmit = () => (
  <SigninRecoveryCode
    finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
    integration={mockWebIntegration}
    signinState={mockSigninLocationState}
    submitRecoveryCode={mockCodeError}
  />
);

export const WithBannerErrorOnSubmit = () => (
  <SigninRecoveryCode
    finishOAuthFlowHandler={mockFinishOAuthFlowHandler}
    integration={mockWebIntegration}
    signinState={mockSigninLocationState}
    submitRecoveryCode={mockOtherError}
  />
);
