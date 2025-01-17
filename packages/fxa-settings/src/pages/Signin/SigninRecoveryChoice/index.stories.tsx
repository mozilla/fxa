/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import SigninRecoveryChoice from '.';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { MOCK_SIGNIN_LOCATION_STATE } from './mocks';
import { LocationProvider } from '@reach/router';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';

export default {
  title: 'Pages/Signin/SigninRecoveryChoice',
  component: SigninRecoveryChoice,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <LocationProvider>
    <SigninRecoveryChoice
      handlePhoneChoice={() => Promise.resolve()}
      lastFourPhoneDigits="1234"
      numBackupCodes={4}
      signinState={MOCK_SIGNIN_LOCATION_STATE}
    />
  </LocationProvider>
);

export const WithSMSSendRateLimitExceeded = () => (
  <LocationProvider>
    <SigninRecoveryChoice
      handlePhoneChoice={() =>
        Promise.resolve(AuthUiErrors.SMS_SEND_RATE_LIMIT_EXCEEDED)
      }
      lastFourPhoneDigits="1234"
      numBackupCodes={4}
      signinState={MOCK_SIGNIN_LOCATION_STATE}
    />
  </LocationProvider>
);

export const WithUnexpectedError = () => (
  <LocationProvider>
    <SigninRecoveryChoice
      handlePhoneChoice={() => Promise.resolve(AuthUiErrors.UNEXPECTED_ERROR)}
      lastFourPhoneDigits="1234"
      numBackupCodes={4}
      signinState={MOCK_SIGNIN_LOCATION_STATE}
    />
  </LocationProvider>
);

export const WithBackendServiceFailure = () => (
  <LocationProvider>
    <SigninRecoveryChoice
      handlePhoneChoice={() =>
        Promise.resolve(AuthUiErrors.BACKEND_SERVICE_FAILURE)
      }
      lastFourPhoneDigits="1234"
      numBackupCodes={4}
      signinState={MOCK_SIGNIN_LOCATION_STATE}
    />
  </LocationProvider>
);

export const WithThrottlingError = () => (
  <LocationProvider>
    <SigninRecoveryChoice
      handlePhoneChoice={() => Promise.resolve(AuthUiErrors.THROTTLED)}
      lastFourPhoneDigits="1234"
      numBackupCodes={4}
      signinState={MOCK_SIGNIN_LOCATION_STATE}
    />
  </LocationProvider>
);
