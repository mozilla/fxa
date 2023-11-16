/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import Ready from '../../../components/Ready';
import AppLayout from '../../../components/AppLayout';
import { ResetPasswordConfirmedProps } from './interfaces';

export const viewName = 'reset-password-confirmed';

const ResetPasswordConfirmed = ({
  continueHandler,
  isSignedIn,
  serviceName,
}: ResetPasswordConfirmedProps & RouteComponentProps) => {
  return (
    <AppLayout>
      <Ready {...{ continueHandler, isSignedIn, viewName, serviceName }} />
    </AppLayout>
  );
};

export default ResetPasswordConfirmed;
