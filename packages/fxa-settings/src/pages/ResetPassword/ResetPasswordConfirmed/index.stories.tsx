/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ResetPasswordConfirmed from '.';
import { MozServices } from '../../../lib/types';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Pages/ResetPassword/ResetPasswordConfirmed',
  component: ResetPasswordConfirmed,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <ResetPasswordConfirmed
    continueHandler={() => {}}
    serviceName={MozServices.Monitor}
  />
);

export const WithErrorMessage = () => (
  <ResetPasswordConfirmed
    errorMessage="An error occurred"
    serviceName={MozServices.Default}
    continueHandler={() => {}}
  />
);
