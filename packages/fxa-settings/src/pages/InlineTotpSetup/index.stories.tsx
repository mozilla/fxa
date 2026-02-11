/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import InlineTotpSetup from '.';
import { Meta } from '@storybook/react';
import { MozServices } from '../../lib/types';
import { MOCK_TOTP_TOKEN } from './mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { action } from '@storybook/addon-actions';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { createMockIntegrationWithCms } from '../mocks';

export default {
  title: 'Pages/InlineTotpSetup',
  component: InlineTotpSetup,
  decorators: [withLocalization],
} as Meta;

const verifyCodeHandler = (code: string) => {
  action('verifyCodeHandler')(code);
  return Promise.resolve();
};

export const Default = () => (
  <InlineTotpSetup
    totp={MOCK_TOTP_TOKEN}
    serviceName={MozServices.Addons}
    verifyCodeHandler={verifyCodeHandler}
  />
);

export const onError = () => (
  <InlineTotpSetup
    totp={MOCK_TOTP_TOKEN}
    serviceName={MozServices.Addons}
    verifyCodeHandler={(code) => {
      action('verifyCodeHandler')(code);
      return Promise.reject(AuthUiErrors.INVALID_TOTP_CODE);
    }}
  />
);

export const WithCms = () => (
  <InlineTotpSetup
    totp={MOCK_TOTP_TOKEN}
    serviceName={MozServices.Addons}
    verifyCodeHandler={verifyCodeHandler}
    integration={createMockIntegrationWithCms()}
  />
);
