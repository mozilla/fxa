/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import Ready from '../../../components/Ready';
import AppLayout from '../../../components/AppLayout';
import { ResetPasswordConfirmedProps } from './interfaces';

export const viewName = 'reset-password-confirmed';

const ResetPasswordConfirmed = ({
  continueHandler,
  isSignedIn,
  integration,
}: ResetPasswordConfirmedProps & RouteComponentProps) => {
  const [serviceName, setServiceName] = useState<string>();
  const [isSync, setIsSync] = useState<boolean>();

  useEffect(() => {
    (async () => {
      setServiceName(await integration.getServiceName());
      setIsSync(await integration.isSync());
    })();
  });

  return (
    <AppLayout>
      <Ready
        {...{ continueHandler, isSignedIn, isSync, viewName, serviceName }}
      />
    </AppLayout>
  );
};

export default ResetPasswordConfirmed;
