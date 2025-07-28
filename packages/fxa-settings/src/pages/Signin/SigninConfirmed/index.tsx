/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import Ready from '../../../components/Ready';
import { MozServices } from '../../../lib/types';
import AppLayout from '../../../components/AppLayout';
import { Integration } from '../../../models';

type SigninConfirmedProps = {
  continueHandler?: Function;
  isSignedIn: boolean;
  serviceName?: MozServices;
  integration?: Integration;
};

export const viewName = 'signin-confirmed';

const SigninConfirmed = ({
  continueHandler,
  isSignedIn,
  serviceName,
  integration
}: SigninConfirmedProps & RouteComponentProps) => (
  <AppLayout integration={integration}>
    <Ready {...{ continueHandler, isSignedIn, viewName, serviceName, integration }} />
  </AppLayout>
);

export default SigninConfirmed;
