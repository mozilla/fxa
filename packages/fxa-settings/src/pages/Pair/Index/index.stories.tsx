/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Pair from '.';
import { Meta } from '@storybook/react';
import { MemoryRouter } from 'react-router';
import { MOCK_ERROR } from './mocks';
import { MOCK_CMS_INFO } from '../../mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';
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
  <MemoryRouter>
    <Pair />
  </MemoryRouter>
);

export const ChoiceScreenWithSigninBanner = () => (
  <MemoryRouter initialEntries={[{ pathname: '/', state: { origin: 'signin' } }]}>
    <Pair />
  </MemoryRouter>
);

export const ChoiceScreenWithSignupBanner = () => (
  <MemoryRouter initialEntries={[{ pathname: '/', state: { origin: 'signup' } }]}>
    <Pair />
  </MemoryRouter>
);

export const ChoiceScreenWithPasswordCreatedBanner = () => (
  <MemoryRouter initialEntries={[{ pathname: '/', state: { origin: 'post-verify-set-password' } }]}>
    <Pair />
  </MemoryRouter>
);

export const SendTabChoiceScreen = () => (
  <MemoryRouter>
    <Pair integration={sendTabIntegration} />
  </MemoryRouter>
);

export const SendTabChoiceScreenWithSigninBanner = () => (
  <MemoryRouter initialEntries={[{ pathname: '/', state: { origin: 'signin' } }]}>
    <Pair integration={sendTabIntegration} />
  </MemoryRouter>
);

export const WithError = () => (
  <MemoryRouter>
    <Pair error={MOCK_ERROR} />
  </MemoryRouter>
);

export const WithErrorOnChoiceScreen = () => (
  <MemoryRouter>
    <Pair error={MOCK_ERROR} />
  </MemoryRouter>
);

// CMS-themed variant: passes a mock relier CMS config so the choice screen
// renders with the relier's button color, background, and header logo.
// Mirrors the parity Backbone has via fetchCmsConfig() in pair/index.js.
export const ChoiceScreenWithCmsTheming = () => (
  <MemoryRouter>
    <Pair cmsInfo={MOCK_CMS_INFO} />
  </MemoryRouter>
);
