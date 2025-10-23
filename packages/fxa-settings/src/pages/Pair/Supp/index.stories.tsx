/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import Supp from '.';
import { MOCK_ERROR } from './mocks';

export default {
  title: 'Pages/Pair/Supp',
  component: Supp,
  decorators: [withLocalization],
} as Meta;

export const DefaultLoadingState = () => <Supp />;

export const WithErrorMessage = () => <Supp error={MOCK_ERROR} />;
