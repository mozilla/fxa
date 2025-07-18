/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import Ready, { ReadyBaseIntegration } from '../../../components/Ready';
import AppLayout from '../../../components/AppLayout';
import { MozServices } from '../../../lib/types';

type SignupConfirmedProps = {
  continueHandler?: Function;
  isSignedIn: boolean;
  serviceName?: MozServices;
  integration?: ReadyBaseIntegration;
};

export const viewName = 'signup-confirmed';

const SignupConfirmed = ({
  continueHandler,
  isSignedIn,
  serviceName,
  integration,
}: SignupConfirmedProps & RouteComponentProps) => (
  <AppLayout integration={integration}>
    <Ready {...{ continueHandler, isSignedIn, viewName, serviceName, integration }} />
  </AppLayout>
);

export default SignupConfirmed;
