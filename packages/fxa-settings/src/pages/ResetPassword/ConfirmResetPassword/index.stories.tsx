/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import ConfirmResetPassword from '.';
import { Subject } from './mocks';

export default {
  title: 'Pages/ResetPassword/ConfirmResetPassword',
  component: ConfirmResetPassword,
  decorators: [withLocalization],
} as Meta;

export const WithResendSuccess = () => <Subject />;

export const WithResendError = () => <Subject resendSuccess={false} />;
