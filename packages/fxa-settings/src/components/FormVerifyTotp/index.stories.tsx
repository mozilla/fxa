/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import FormVerifyTotp from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import Subject from './mocks';

export default {
  title: 'Components/FormVerifyTotp',
  component: FormVerifyTotp,
  decorators: [withLocalization],
} as Meta;

export const With6DigitCode = () => <Subject />;

export const With8DigitCode = () => <Subject codeLength={8} />;

export const With10CharAlphanumericCode = () => (
  <Subject codeLength={10} codeType="alphanumeric" />
);

export const WithErrorOnSubmit = () => <Subject success={false} />;
