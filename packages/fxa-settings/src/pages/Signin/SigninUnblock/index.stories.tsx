/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import SigninUnblock from '.';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import {
  MOCK_AUTH_AT,
  MOCK_EMAIL,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
} from '../../mocks';
import VerificationMethods from '../../../constants/verification-methods';
import VerificationReasons from '../../../constants/verification-reasons';

export default {
  title: 'Pages/Signin/SigninUnblock',
  component: SigninUnblock,
  decorators: [withLocalization],
} as Meta;

const mockSuccessResponse = () =>
  Promise.resolve({
    data: {
      signIn: {
        uid: MOCK_UID,
        sessionToken: MOCK_SESSION_TOKEN,
        authAt: MOCK_AUTH_AT,
        metricsEnabled: true,
        verified: true,
        verificationMethod: VerificationMethods.EMAIL_CAPTCHA,
        verificationReason: VerificationReasons.SIGN_IN,
      },
    },
  });
const mockResendSuccessResponse = () => Promise.resolve({ success: true });
const mockResendErrorResponse = () =>
  Promise.resolve({
    success: false,
    localizedErrorMessage: 'Something went wrong',
  });

export const Default = () => (
  <LocationProvider>
    <SigninUnblock
      email={MOCK_EMAIL}
      hasLinkedAccount={false}
      hasPassword={true}
      signinWithUnblockCode={mockSuccessResponse}
      resendUnblockCodeHandler={mockResendSuccessResponse}
    />
  </LocationProvider>
);

export const WithResendError = () => (
  <LocationProvider>
    <SigninUnblock
      email={MOCK_EMAIL}
      hasLinkedAccount={false}
      hasPassword={true}
      signinWithUnblockCode={mockSuccessResponse}
      resendUnblockCodeHandler={mockResendErrorResponse}
    />
  </LocationProvider>
);
