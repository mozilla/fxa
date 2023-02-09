/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Supp from '.';
import { Meta } from '@storybook/react';
import { MOCK_ERROR } from './mocks';

export default {
  title: 'pages/Pair/Supp',
  component: Supp,
} as Meta;

export const DefaultLoadingState = () => <Supp />;

export const WithErrorMessage = () => <Supp error={MOCK_ERROR} />;
