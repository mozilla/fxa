/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';

import { withLocalization } from 'fxa-react/lib/storybooks';
import { Subject } from './mocks';
import Page2faChange from '.';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Pages/Settings/TwoStepAuthChange',
  component: Page2faChange,
  decorators: [withLocalization],
} as Meta;

export const Default = () => <Subject />;

export const WithError = () => (
  <Subject
    account={{
      confirmReplaceTotpWithJwt: async (code: string) => {
        action(`confirmReplaceTotpWithJwt called with code: ${code}`)();
        throw AuthUiErrors.INVALID_TOTP_CODE;
      },
    }}
  />
);
