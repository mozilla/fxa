/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import Ready from '../../../components/Ready';

type SignupConfirmedProps = {
  continueHandler?: Function;
  serviceName?: string;
};

const SignupConfirmed = ({
  continueHandler,
  serviceName,
}: SignupConfirmedProps & RouteComponentProps) => {
  const viewName = 'signup-confirmed';

  return <Ready {...{ continueHandler, viewName, serviceName }} />;
};

export default SignupConfirmed;
