/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import ResetPasswordRecoveryChoice from '.';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { LocationProvider } from '@reach/router';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { MOCK_MASKED_PHONE_NUMBER_WITH_COPY } from '../../mocks';

const fakeState = {
  token: 'tok',
  code: '123098',
  uid: '9001',
  email: 'testo@example.gg',
};
export default {
  title: 'Pages/ResetPassword/ResetPasswordRecoveryChoice',
  component: ResetPasswordRecoveryChoice,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <LocationProvider>
    <ResetPasswordRecoveryChoice
      handlePhoneChoice={() => Promise.resolve()}
      maskedPhoneNumber={MOCK_MASKED_PHONE_NUMBER_WITH_COPY}
      lastFourPhoneDigits="1234"
      numBackupCodes={4}
      completeResetPasswordLocationState={fakeState}
    />
  </LocationProvider>
);

export const WithSMSSendRateLimitExceeded = () => (
  <LocationProvider>
    <ResetPasswordRecoveryChoice
      handlePhoneChoice={() =>
        Promise.resolve(AuthUiErrors.SMS_SEND_RATE_LIMIT_EXCEEDED)
      }
      maskedPhoneNumber={MOCK_MASKED_PHONE_NUMBER_WITH_COPY}
      lastFourPhoneDigits="1234"
      numBackupCodes={4}
      completeResetPasswordLocationState={fakeState}
    />
  </LocationProvider>
);

export const WithUnexpectedError = () => (
  <LocationProvider>
    <ResetPasswordRecoveryChoice
      handlePhoneChoice={() => Promise.resolve(AuthUiErrors.UNEXPECTED_ERROR)}
      maskedPhoneNumber={MOCK_MASKED_PHONE_NUMBER_WITH_COPY}
      lastFourPhoneDigits="1234"
      numBackupCodes={4}
      completeResetPasswordLocationState={fakeState}
    />
  </LocationProvider>
);

export const WithBackendServiceFailure = () => (
  <LocationProvider>
    <ResetPasswordRecoveryChoice
      handlePhoneChoice={() =>
        Promise.resolve(AuthUiErrors.BACKEND_SERVICE_FAILURE)
      }
      maskedPhoneNumber={MOCK_MASKED_PHONE_NUMBER_WITH_COPY}
      lastFourPhoneDigits="1234"
      numBackupCodes={4}
      completeResetPasswordLocationState={fakeState}
    />
  </LocationProvider>
);

export const WithThrottlingError = () => (
  <LocationProvider>
    <ResetPasswordRecoveryChoice
      handlePhoneChoice={() => Promise.resolve(AuthUiErrors.THROTTLED)}
      maskedPhoneNumber={MOCK_MASKED_PHONE_NUMBER_WITH_COPY}
      lastFourPhoneDigits="1234"
      numBackupCodes={4}
      completeResetPasswordLocationState={fakeState}
    />
  </LocationProvider>
);
