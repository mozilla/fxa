/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import Ready from '../../components/Ready';

type ResetPasswordConfirmedProps = {
  continueHandler?: Function;
  serviceName?: string;
};

const ResetPasswordConfirmed = ({
  continueHandler,
  serviceName,
}: ResetPasswordConfirmedProps & RouteComponentProps) => {
  // This is pretty ridiculously barebones, but the content in here gets expanded on other, similar views.
  const viewName = 'settings.reset-password-confirmed';
  const baseActionName = 'reset_password_confirmed';

  return (
    <Ready
      continueHandler={continueHandler}
      viewName={viewName}
      baseActionName={baseActionName}
      serviceName={serviceName}
    />
  );
};

export default ResetPasswordConfirmed;
