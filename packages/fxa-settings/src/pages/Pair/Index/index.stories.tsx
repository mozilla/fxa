/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Pair from '.';
import { Meta } from '@storybook/react';
import { LocationProvider } from '@reach/router';
import { MOCK_ERROR } from './mocks';
import { MOCK_CMS_INFO } from '../../mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { createHistoryWithQuery } from '../../../models/mocks';
import type { Integration } from '../../../models';

const sendTabIntegration = {
  data: { entrypoint: 'send-tab-toolbar-icon' },
} as unknown as Integration;

export default {
  title: 'Pages/Pair',
  component: Pair,
  decorators: [withLocalization],
} as Meta;

export const ChoiceScreen = () => (
  <LocationProvider>
    <Pair />
  </LocationProvider>
);

export const ChoiceScreenWithSigninBanner = () => (
  <LocationProvider
    history={createHistoryWithQuery('/', undefined, { origin: 'signin' })}
  >
    <Pair />
  </LocationProvider>
);

export const ChoiceScreenWithSignupBanner = () => (
  <LocationProvider
    history={createHistoryWithQuery('/', undefined, { origin: 'signup' })}
  >
    <Pair />
  </LocationProvider>
);

export const ChoiceScreenWithPasswordCreatedBanner = () => (
  <LocationProvider
    history={createHistoryWithQuery('/', undefined, {
      origin: 'post-verify-set-password',
    })}
  >
    <Pair />
  </LocationProvider>
);

export const SendTabChoiceScreen = () => (
  <LocationProvider>
    <Pair integration={sendTabIntegration} />
  </LocationProvider>
);

export const SendTabChoiceScreenWithSigninBanner = () => (
  <LocationProvider
    history={createHistoryWithQuery('/', undefined, { origin: 'signin' })}
  >
    <Pair integration={sendTabIntegration} />
  </LocationProvider>
);

export const WithError = () => (
  <LocationProvider>
    <Pair error={MOCK_ERROR} />
  </LocationProvider>
);

export const WithErrorOnChoiceScreen = () => (
  <LocationProvider>
    <Pair error={MOCK_ERROR} />
  </LocationProvider>
);

// CMS-themed variant: passes a mock relier CMS config so the choice screen
// renders with the relier's button color, background, and header logo.
// Mirrors the parity Backbone has via fetchCmsConfig() in pair/index.js.
export const ChoiceScreenWithCmsTheming = () => (
  <LocationProvider>
    <Pair cmsInfo={MOCK_CMS_INFO} />
  </LocationProvider>
);
