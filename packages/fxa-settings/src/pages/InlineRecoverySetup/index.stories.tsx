/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import InlineRecoverySetup from '.';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MOCK_RECOVERY_CODES, MOCK_SERVICE_NAME } from './mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { InlineRecoverySetupProps } from './interfaces';
import { MOCK_EMAIL } from '../mocks';

export default {
  title: 'Pages/InlineRecoverySetup',
  component: InlineRecoverySetup,
  decorators: [withLocalization],
} as Meta;

const cancelSetupHandler = () => {};
const verifyTotpHandler = async () => true;
const successfulSetupHandler = () => {};
const props = {
  recoveryCodes: MOCK_RECOVERY_CODES,
  serviceName: MOCK_SERVICE_NAME,
  cancelSetupHandler,
  verifyTotpHandler,
  successfulSetupHandler,
};

const ComponentWithRouter = (props: InlineRecoverySetupProps) => (
  <LocationProvider>
    <InlineRecoverySetup {...props} />
  </LocationProvider>
);

export const Default = () => (
  <ComponentWithRouter
    recoveryCodes={MOCK_RECOVERY_CODES}
    cancelSetupHandler={cancelSetupHandler}
    verifyTotpHandler={verifyTotpHandler}
    successfulSetupHandler={successfulSetupHandler}
    email={MOCK_EMAIL}
  />
);

export const WithServiceName = () => (
  <ComponentWithRouter {...props} email={MOCK_EMAIL} />
);
