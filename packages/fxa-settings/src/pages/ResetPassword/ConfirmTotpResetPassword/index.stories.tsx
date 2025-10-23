/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import ConfirmTotpResetPassword from '.';
import { Subject } from './mocks';

export default {
  title: 'Pages/ResetPassword/ConfirmTotpResetPassword',
  component: ConfirmTotpResetPassword,
  decorators: [withLocalization],
} as Meta;

export const Default = () => <Subject />;

export const WithErrorBanner = () => (
  <Subject errorMessage="Unexpected error" />
);
