/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { LocationProvider } from '@reach/router';
import UnitRowTwoStepAuth from '.';
import { createSubject } from './mocks';
import { MOCK_FULL_PHONE_NUMBER } from '../../../pages/mocks';

export default {
  title: 'Components/Settings/UnitRowTwoStepAuth',
  component: UnitRowTwoStepAuth,
  decorators: [
    withLocalization,
    (Story) => (
      <LocationProvider>
        {/* Added to represent the section in which rows are nested */}
        <div className="bg-white tablet:rounded-xl shadow">
          <Story />
        </div>
      </LocationProvider>
    ),
  ],
} as Meta;

export const TFAEnabledWithBackupCodesRemainingAndRecoveryPhoneUnavailable =
  () =>
    createSubject({
      recoveryPhone: { exists: false, phoneNumber: null, available: false },
    });

export const TFAEnabledNoCodesRemaining = () =>
  createSubject({
    backupCodes: { hasBackupCodes: false, count: 0 },
  });

export const TFADisabled = () =>
  createSubject({
    totp: { exists: false, verified: false },
    backupCodes: { count: 0 },
  });

export const DisabledNoPassword = () =>
  createSubject({
    hasPassword: false,
    totp: { enabled: false },
    backupCodes: { count: 0 },
  });

export const TwoFAEnabledWithBackupCodesNoBackupPhone = () =>
  createSubject({
    recoveryPhone: { exists: false, phoneNumber: null, available: true },
  });

export const TwoFAEnabledWithBackupPhoneNoBackupCodes = () =>
  createSubject({
    recoveryPhone: {
      exists: true,
      phoneNumber: MOCK_FULL_PHONE_NUMBER,
      available: true,
    },
    backupCodes: { hasBackupCodes: false, count: 0 },
  });

export const TwoFAEnabledWithBackupCodesAndBackupPhone = () =>
  createSubject({
    recoveryPhone: {
      exists: true,
      phoneNumber: MOCK_FULL_PHONE_NUMBER,
      available: true,
    },
  });

// if backup codes run out and user does not replace them
// Recovery phone not shown since `available` is based on region and recovery codes
export const TwoFAEnabledNoBackupCodesNoBackupPhone = () =>
  createSubject({
    backupCodes: { hasBackupCodes: false, count: 0 },
    recoveryPhone: { exists: false, phoneNumber: null, available: false },
  });

// User is currently in an unsupported region, but already has a previously added backup phone
export const TwoFAEnabledWithBackupPhoneAndUnsupportedCurrentRegion = () =>
  createSubject({
    recoveryPhone: {
      exists: true,
      phoneNumber: MOCK_FULL_PHONE_NUMBER,
      available: false,
    },
    backupCodes: { hasBackupCodes: true, count: 1 },
  });
