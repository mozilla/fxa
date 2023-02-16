/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Pair from '.';
import { Meta } from '@storybook/react';
import AppLayout from '../../../components/AppLayout';
import { LocationProvider } from '@reach/router';
import { ENTRYPOINTS } from '../../../constants';
import { MOCK_ERROR, MOCK_CALLBACK } from './mocks';
import { withLocalization } from '../../../../.storybook/decorators';

export default {
  title: 'Pages/Pair',
  component: Pair,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <LocationProvider>
    <AppLayout>
      <Pair
        entryPoint={ENTRYPOINTS.FIREFOX_FX_VIEW_ENTRYPOINT}
        onSubmit={MOCK_CALLBACK}
      />
    </AppLayout>
  </LocationProvider>
);

export const WithoutQRCode = () => (
  <LocationProvider>
    <AppLayout>
      <Pair onSubmit={MOCK_CALLBACK} />
    </AppLayout>
  </LocationProvider>
);

export const WithError = () => (
  <LocationProvider>
    <AppLayout>
      <Pair
        entryPoint={ENTRYPOINTS.FIREFOX_FX_VIEW_ENTRYPOINT}
        error={MOCK_ERROR}
        onSubmit={MOCK_CALLBACK}
      />
    </AppLayout>
  </LocationProvider>
);
