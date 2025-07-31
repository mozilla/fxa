/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import InlineRecoverySetup from '.';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { InlineRecoverySetupProps } from './interfaces';
import { MOCK_BACKUP_CODES, MOCK_EMAIL, createMockIntegrationWithCms } from '../mocks';
import { MozServices } from '../../lib/types';

export default {
  title: 'Pages/InlineRecoverySetup',
  component: InlineRecoverySetup,
  decorators: [withLocalization],
} as Meta;

const cancelSetupHandler = () => {};
const verifyTotpHandler = async () => true;
const successfulSetupHandler = () => {};
const props = {
  recoveryCodes: MOCK_BACKUP_CODES,
  serviceName: MozServices.Default,
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
    recoveryCodes={MOCK_BACKUP_CODES}
    cancelSetupHandler={cancelSetupHandler}
    verifyTotpHandler={verifyTotpHandler}
    successfulSetupHandler={successfulSetupHandler}
    email={MOCK_EMAIL}
  />
);

export const WithServiceName = () => (
  <ComponentWithRouter {...props} email={MOCK_EMAIL} />
);

export const WithCms = () => (
  <ComponentWithRouter
    recoveryCodes={MOCK_BACKUP_CODES}
    cancelSetupHandler={cancelSetupHandler}
    verifyTotpHandler={verifyTotpHandler}
    successfulSetupHandler={successfulSetupHandler}
    email={MOCK_EMAIL}
    integration={createMockIntegrationWithCms()}
  />
);
