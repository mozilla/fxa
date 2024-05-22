/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { Subject } from './mocks';
import CompleteResetPassword from '.';

export default {
  title: 'Pages/ResetPasswordRedesign/CompleteResetPassword',
  component: CompleteResetPassword,
  decorators: [withLocalization],
} as Meta;

export const DefaultNoRecoveryKey = () => <Subject recoveryKeyExists={false} />;

export const WithConfirmedRecoveryKey = () => (
  <Subject recoveryKeyExists={true} hasConfirmedRecoveryKey />
);

export const UnknownRecoveryKeyStatus = () => <Subject />;
