/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import InlineTotpSetupOld from './old';
import { Meta } from '@storybook/react';
import { MozServices } from '../../lib/types';
import { MOCK_TOTP_TOKEN } from './mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { action } from '@storybook/addon-actions';
import { createMockIntegrationWithCms } from '../mocks';

export default {
  title: 'Pages/InlineTotpSetupOld',
  component: InlineTotpSetupOld,
  decorators: [withLocalization],
} as Meta;

const cancelSetupHandler = () => {};
const verifyCodeHandler = (code: string) => {
  action('verifyCodeHandler')(code);
  return Promise.resolve();
};

export const Default = () => (
  <InlineTotpSetupOld
    totp={MOCK_TOTP_TOKEN}
    cancelSetupHandler={cancelSetupHandler}
    verifyCodeHandler={verifyCodeHandler}
  />
);

export const WithCustomService = () => (
  <InlineTotpSetupOld
    totp={MOCK_TOTP_TOKEN}
    serviceName={MozServices.Monitor}
    cancelSetupHandler={cancelSetupHandler}
    verifyCodeHandler={verifyCodeHandler}
  />
);

export const WithCms = () => (
  <InlineTotpSetupOld
    totp={MOCK_TOTP_TOKEN}
    serviceName={MozServices.Monitor}
    cancelSetupHandler={cancelSetupHandler}
    verifyCodeHandler={verifyCodeHandler}
    integration={createMockIntegrationWithCms()}
  />
);
