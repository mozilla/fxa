/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { MemoryRouter } from 'react-router';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { IntegrationType } from '../../models/integrations';
import { PromoQrMobile } from '.';
import AppLayout from '../AppLayout';

export default {
  title: 'Components/PromoQrMobile',
  component: PromoQrMobile,
  decorators: [withLocalization],
} as Meta;

export const Default = () => {
  
  return (
    <MemoryRouter initialEntries={['/']}>
      <PromoQrMobile
        integration={{ type: IntegrationType.Web, isDesktopSync: () => false }}
      />
    </MemoryRouter>
  );
};

export const WithCardAppLayout = () => {
  
  return (
    <MemoryRouter initialEntries={['/']}>
      <AppLayout>
        <h1 className="card-header">Sign in</h1>
        <p className="mt-2">Continue to account settings</p>
      </AppLayout>
      <PromoQrMobile
        integration={{ type: IntegrationType.Web, isDesktopSync: () => false }}
      />
    </MemoryRouter>
  );
};

export const DesktopSync = () => {
  return (
    <MemoryRouter initialEntries={['/']}>
      <PromoQrMobile
        integration={{
          type: IntegrationType.OAuthNative,
          isDesktopSync: () => true,
        }}
      />
    </MemoryRouter>
  );
};
