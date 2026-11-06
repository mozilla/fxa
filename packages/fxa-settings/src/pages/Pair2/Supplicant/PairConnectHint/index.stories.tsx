/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { MemoryRouter } from 'react-router';
import { withLocalization } from 'fxa-react/lib/storybooks';
import PairConnectHint from '.';

export default {
  title: 'Pages/Pair2/Supplicant/PairConnectHint',
  component: PairConnectHint,
  decorators: [withLocalization],
} as Meta;

export const Ios = () => (
  <MemoryRouter>
    <PairConnectHint os="ios" />
  </MemoryRouter>
);
export const Android = () => (
  <MemoryRouter>
    <PairConnectHint os="android" />
  </MemoryRouter>
);
export const CustomTab = () => (
  <MemoryRouter initialEntries={['/?embed=customtab']}>
    <PairConnectHint os="android" />
  </MemoryRouter>
);
