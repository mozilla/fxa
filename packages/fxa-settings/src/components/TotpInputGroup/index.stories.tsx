/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import TotpInputGroup from '.';
import { withLocalization } from 'fxa-react/lib/storybooks';
import Subject from './mocks';

export default {
  title: 'Components/TotpInputGroup',
  component: TotpInputGroup,
  decorators: [withLocalization],
} as Meta;

export const With6Digits = () => <Subject />;

export const With8Digits = () => <Subject codeLength={8} />;

export const WithError = () => (
  <Subject initialErrorMessage="Sample error message." />
);
