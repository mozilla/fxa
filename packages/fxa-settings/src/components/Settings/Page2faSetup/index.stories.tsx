/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { action } from '@storybook/addon-actions';
import { Meta } from '@storybook/react';

import { withLocalization } from 'fxa-react/lib/storybooks';
import { totpUtils } from '../../../lib/totp-utils';
import Page2faSetup from '.';
import { Subject } from './mocks';

// mock check code function to avoid requiring a real totp that changes every 30s
totpUtils.checkCode = async () => true;
totpUtils.getCode = async () => '';

export default {
  title: 'Pages/Settings/TwoStepAuthSetup',
  component: Page2faSetup,
  decorators: [withLocalization],
} as Meta;

export const WithRecoveryPhoneOption = () => (
  <Subject
    account={{
      recoveryPhone: { available: true },
      verifyTotp: async () => {
        action('Verify and enable 2FA')();
      },
      addRecoveryPhone: async (phoneNumber: string) => {
        action('Start phone setup')();
        return { nationalFormat: phoneNumber };
      },
      confirmRecoveryPhone: async () => {
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
      verifyTotp: async () => {
        action('Verify and enable 2FA')();
      },
      refresh: async () => {
        action('Refresh account data for display in settings page')();
      },
    }}
  />
);
