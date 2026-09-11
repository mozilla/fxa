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

// Storybook has no Nimbus fetch, so supply the branch value directly.
const withBranch = (
  feature: Record<string, unknown>,
  children: React.ReactNode
) => (
  <NimbusContext.Provider
    value={{
      experiments: {
        nimbusUserId: 'storybook',
        enrollments: [],
        features: { 'promo-qr-mobile': { enabled: true, ...feature } },
      },
      loading: false,
    }}
  >
    {children}
  </NimbusContext.Provider>
);

const story = (feature: Record<string, unknown>) => () => (
  <MemoryRouter initialEntries={['/']}>
    {withBranch(feature, <PromoQrMobile integration={webIntegration} />)}
  </MemoryRouter>
);

// One line. No heading set, so the Fluent control copy shows.
export const Control = story({ branch: 'control' });

// Two lines.
export const TreatmentB = story({
  branch: 'treatment-b',
  heading: 'Your tabs and more, ready on your phone',
});

// Three lines, the longest heading the layout has to hold.
export const TreatmentA = story({
  branch: 'treatment-a',
  heading: 'Pick up where you left off, wherever you go',
});

// Experimenter can override the call to action too.
export const CustomDescription = story({
  branch: 'treatment-c',
  heading: 'The browser you trust, on your phone',
  description: 'Point your camera here',
});

export const WithCardAppLayout = () => (
  <MemoryRouter initialEntries={['/']}>
    <AppLayout>
      <h1 className="card-header">Sign in</h1>
      <p className="mt-2">Continue to account settings</p>
    </AppLayout>
    {withBranch(
      {
        branch: 'treatment-a',
        heading: 'Pick up where you left off, wherever you go',
      },
      <PromoQrMobile integration={webIntegration} />
    )}
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
