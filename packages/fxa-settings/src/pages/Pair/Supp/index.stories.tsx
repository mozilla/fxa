/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Supp from '.';
import { MemoryRouter } from 'react-router';
import { Meta } from '@storybook/react';
import { MOCK_ERROR } from './mocks';
import { mockUseFxAStatus } from '../../../lib/hooks/useFxAStatus/mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Pages/Pair/Supp',
  component: Supp,
  decorators: [
    withLocalization,
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} as Meta;

export const DefaultLoadingState = () => (
  <Supp fxaStatusResult={mockUseFxAStatus()} />
);

export const WithError = () => (
  <Supp error={MOCK_ERROR} fxaStatusResult={mockUseFxAStatus()} />
);
