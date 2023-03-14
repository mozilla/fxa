/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import Ready from '../../../components/Ready';
import { MozServices } from '../../../lib/types';
import AppLayout from '../../../components/AppLayout';

type ResetPasswordConfirmedProps = {
  continueHandler?: Function;
  isSignedIn: boolean;
  isSync: boolean;
  serviceName?: MozServices;
};

export const viewName = 'reset-password-confirmed';

const ResetPasswordConfirmed = ({
  continueHandler,
  isSignedIn,
  isSync,
  serviceName,
}: ResetPasswordConfirmedProps & RouteComponentProps) => (
  <AppLayout>
    <Ready
      {...{ continueHandler, isSignedIn, isSync, viewName, serviceName }}
    />
  </AppLayout>
);

export default ResetPasswordConfirmed;
