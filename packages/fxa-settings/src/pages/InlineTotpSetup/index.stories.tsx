/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import InlineTotpSetup from '.';
import { Meta } from '@storybook/react';
import { MozServices } from '../../lib/types';
import { MOCK_EMAIL, MOCK_TOTP_TOKEN } from './mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Pages/InlineTotpSetup',
  component: InlineTotpSetup,
  decorators: [withLocalization],
} as Meta;

const cancelSetupHandler = () => {};
const verifyCodeHandler = () => {};

export const Default = () => (
  <InlineTotpSetup
    totp={MOCK_TOTP_TOKEN}
    email={MOCK_EMAIL}
    cancelSetupHandler={cancelSetupHandler}
    verifyCodeHandler={verifyCodeHandler}
  />
);

export const WithCustomService = () => (
  <InlineTotpSetup
    totp={MOCK_TOTP_TOKEN}
    email={MOCK_EMAIL}
    serviceName={MozServices.Monitor}
    cancelSetupHandler={cancelSetupHandler}
    verifyCodeHandler={verifyCodeHandler}
  />
);
