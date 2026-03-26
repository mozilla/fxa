/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import {
  LocationProvider,
  createHistory,
  createMemorySource,
} from '@reach/router';
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
  const history = createHistory(createMemorySource('/'));

  return (
    <LocationProvider {...{ history }}>
      <PromoQrMobile integration={{ type: IntegrationType.Web }} />
    </LocationProvider>
  );
};

export const WithCardAppLayout = () => {
  const history = createHistory(createMemorySource('/'));

  return (
    <LocationProvider {...{ history }}>
      <AppLayout>
        <h1 className="card-header">Sign in</h1>
        <p className="mt-2">Continue to account settings</p>
      </AppLayout>
      <PromoQrMobile integration={{ type: IntegrationType.Web }} />
    </LocationProvider>
  );
};
