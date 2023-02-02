/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import Ready from '../../../components/Ready';
import { MozServices } from '../../../lib/types';

type SigninConfirmedProps = {
  continueHandler?: Function;
  serviceName?: MozServices;
};

export const viewName = 'signin-confirmed';

const SigninConfirmed = ({
  continueHandler,
  serviceName,
}: SigninConfirmedProps & RouteComponentProps) => (
  <Ready {...{ continueHandler, viewName, serviceName }} />
);

export default SigninConfirmed;
