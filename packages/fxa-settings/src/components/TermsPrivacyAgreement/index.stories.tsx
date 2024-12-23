/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import TermsPrivacyAgreement from '.';
import AppLayout from '../../components/AppLayout';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Components/TermsPrivacyAgreement',
  component: TermsPrivacyAgreement,
  decorators: [withLocalization],
} as Meta;

export const FirefoxOnly = () => (
  <AppLayout>
    <TermsPrivacyAgreement />
  </AppLayout>
);

export const PocketClient = () => (
  <AppLayout>
    <TermsPrivacyAgreement isPocketClient />
  </AppLayout>
);

export const MonitorClient = () => (
  <AppLayout>
    <TermsPrivacyAgreement isMonitorClient />
  </AppLayout>
);
export const RelayClient = () => (
  <AppLayout>
    <TermsPrivacyAgreement isRelayClient />
  </AppLayout>
);

export const OAuthNativeRelay = () => (
  <AppLayout>
    <TermsPrivacyAgreement isDesktopRelay />
  </AppLayout>
);
