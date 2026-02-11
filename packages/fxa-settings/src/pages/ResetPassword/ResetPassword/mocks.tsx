/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MozServices } from '../../../lib/types';
import React, { useState } from 'react';
import ResetPassword from '.';
import { LocationProvider } from '@reach/router';
import { ResetPasswordProps } from './interfaces';

const defaultServiceName = MozServices.Default;
const mockRequestResetPasswordCode = (email: string) => Promise.resolve();

export const Subject = ({
  requestResetPasswordCode = mockRequestResetPasswordCode,
  serviceName = defaultServiceName,
}: Partial<ResetPasswordProps>) => {
  const [errorMessage, setErrorMessage] = useState('');
  return (
    <LocationProvider>
      <ResetPassword
        {...{
          errorMessage,
          serviceName,
          requestResetPasswordCode,
          setErrorMessage,
        }}
      />
    </LocationProvider>
  );
};
