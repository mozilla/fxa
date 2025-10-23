/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { action } from '@storybook/addon-actions';
import { Meta } from '@storybook/react';

import { withLocalization } from 'fxa-react/lib/storybooks';
import { Page2faSetup } from '.';
import { Subject } from './mocks';

export default {
  title: 'Pages/Settings/TwoStepAuthSetup',
  component: Page2faSetup,
  decorators: [withLocalization],
} as Meta;

export const WithRecoveryPhoneOption = () => (
  <Subject
    account={{
      recoveryPhone: { available: true },
      verifyTotpSetupCodeWithJwt: async (code: string) => {
        action('Verify 2FA code')();
      },
      completeTotpSetupWithJwt: async () => {
        action('Complete 2FA setup')();
      },
      addRecoveryPhone: async (phoneNumber: string) => {
        action('Start phone setup')();
        return { nationalFormat: phoneNumber };
      },
      confirmRecoveryPhoneWithJwt: async () => {
        action('Confirm SMS code and add phone')();
      },
      refresh: async () => {
        action('Refresh account data for display in settings page')();
      },
    }}
  />
);

export const WithRecoveryPhoneUnavailable = () => (
  <Subject
    account={{
      recoveryPhone: { available: false },
      verifyTotpSetupCodeWithJwt: async (code: string) => {
        action('Verify 2FA code')();
      },
      completeTotpSetupWithJwt: async () => {
        action('Complete 2FA setup')();
      },
      refresh: async () => {
        action('Refresh account data for display in settings page')();
      },
    }}
  />
);
