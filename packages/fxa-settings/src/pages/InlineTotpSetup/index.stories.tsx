/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import InlineTotpSetup from '.';
import { Meta } from '@storybook/react';
import { MozServices } from '../../lib/types';
import AppLayout from '../../components/AppLayout';
import { MOCK_CODE, MOCK_EMAIL } from './mocks';
import { withLocalization } from '../../../.storybook/decorators';

export default {
  title: 'Pages/InlineTotpSetup',
  component: InlineTotpSetup,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <AppLayout>
    <InlineTotpSetup code={MOCK_CODE} email={MOCK_EMAIL} />
  </AppLayout>
);

export const WithCustomService = () => (
  <AppLayout>
    <InlineTotpSetup
      code={MOCK_CODE}
      email={MOCK_EMAIL}
      serviceName={MozServices.FirefoxMonitor}
    />
  </AppLayout>
);
