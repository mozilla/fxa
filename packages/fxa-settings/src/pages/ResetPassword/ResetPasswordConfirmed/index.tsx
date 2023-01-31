/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import Ready from '../../../components/Ready';
import { MozServices } from '../../../lib/types';

type ResetPasswordConfirmedProps = {
  continueHandler?: Function;
  serviceName?: MozServices;
};

const ResetPasswordConfirmed = ({
  continueHandler,
  serviceName,
}: ResetPasswordConfirmedProps & RouteComponentProps) => {
  // This is pretty ridiculously barebones, but the content in here gets expanded on other, similar views.
  const viewName = 'reset-password-confirmed';

  return <Ready {...{ continueHandler, viewName, serviceName }} />;
};

export default ResetPasswordConfirmed;
