/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import InputPhoneNumber from '.';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { Meta } from '@storybook/react';
import { extendedCountryOptions, Subject } from './mocks';

export default {
  title: 'Components/InputPhoneNumber',
  component: InputPhoneNumber,
  decorators: [withLocalization],
} as Meta;

export const Default = () => <Subject />;

export const WithMoreOptions = () => (
  <Subject countries={extendedCountryOptions} />
);
