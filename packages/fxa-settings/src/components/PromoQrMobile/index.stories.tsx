/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { MemoryRouter } from 'react-router';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { IntegrationType } from '../../models/integrations';
import { PromoQrMobile } from '.';
import AppLayout from '../AppLayout';
import { NimbusContext } from '../../models/contexts/NimbusContext';

export default {
  title: 'Components/PromoQrMobile',
  component: PromoQrMobile,
  decorators: [withLocalization],
} as Meta;

const webIntegration = {
  type: IntegrationType.Web,
  isDesktopSync: () => false,
};

// Storybook has no Nimbus fetch, so supply the branch directly.
const withBranch = (branch: string, children: React.ReactNode) => (
  <NimbusContext.Provider
    value={{
      experiments: {
        nimbusUserId: 'storybook',
        features: { 'promo-qr-mobile': { enabled: true, branch } },
      },
      loading: false,
    }}
  >
    {children}
  </NimbusContext.Provider>
);

const story = (branch: string) => () => (
  <MemoryRouter initialEntries={['/']}>
    {withBranch(branch, <PromoQrMobile integration={webIntegration} />)}
  </MemoryRouter>
);

// One line.
export const Control = story('control');

// Two lines.
export const TreatmentB = story('treatment-b');

// Three lines, the longest string in the experiment.
export const TreatmentA = story('treatment-a');

export const WithCardAppLayout = () => (
  <MemoryRouter initialEntries={['/']}>
    <AppLayout>
      <h1 className="card-header">Sign in</h1>
      <p className="mt-2">Continue to account settings</p>
    </AppLayout>
    {withBranch('treatment-a', <PromoQrMobile integration={webIntegration} />)}
  </MemoryRouter>
);

export const DesktopSync = () => (
  <MemoryRouter initialEntries={['/']}>
    <PromoQrMobile
      integration={{
        type: IntegrationType.OAuthNative,
        isDesktopSync: () => true,
      }}
    />
  </MemoryRouter>
);
