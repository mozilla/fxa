/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import InlineRecoverySetup, { InlineRecoverySetupProps } from '.';
import AppLayout from '../../components/AppLayout';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MOCK_RECOVERY_CODES, MOCK_SERVICE_NAME } from './mocks';

export default {
  title: 'pages/InlineRecoverySetup',
  component: InlineRecoverySetup,
} as Meta;

const ComponentWithRouter = (props: InlineRecoverySetupProps) => (
  <LocationProvider>
    <AppLayout>
      <InlineRecoverySetup {...props} />
    </AppLayout>
  </LocationProvider>
);

export const Default = () => (
  <ComponentWithRouter
    recoveryCodes={MOCK_RECOVERY_CODES}
    showConfirmation={false}
  />
);

export const ServiceNameDontShowConfirmation = () => (
  <ComponentWithRouter
    recoveryCodes={MOCK_RECOVERY_CODES}
    showConfirmation={false}
    serviceName={MOCK_SERVICE_NAME}
  />
);

export const isIOS = () => (
  <ComponentWithRouter
    recoveryCodes={MOCK_RECOVERY_CODES}
    showConfirmation={false}
    serviceName={MOCK_SERVICE_NAME}
    isIOS={true}
  />
);

export const ShowConfirmation = () => (
  <ComponentWithRouter
    recoveryCodes={MOCK_RECOVERY_CODES}
    showConfirmation={true}
  />
);

export const ShowConfirmationWithServiceName = () => (
  <ComponentWithRouter
    recoveryCodes={MOCK_RECOVERY_CODES}
    showConfirmation={true}
    serviceName={MOCK_SERVICE_NAME}
  />
);
