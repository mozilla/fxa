/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Signin, { SigninProps } from '.';
import AppLayout from '../../components/AppLayout';
import { MozServices } from '../../lib/types';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MOCK_EMAIL, MOCK_SERVICE } from './mocks';
export default {
  title: 'pages/Signin',
  component: Signin,
} as Meta;

// TODO: Add in error and success states when the Banner is added in
const SigninWithProvider = ({
  email,
  isPasswordNeeded,
  serviceName,
}: SigninProps) => {
  return (
    <LocationProvider>
      <AppLayout>
        <Signin {...{ email, isPasswordNeeded, serviceName }} />
      </AppLayout>
    </LocationProvider>
  );
};

export const PasswordNeeded = () => (
  <SigninWithProvider email={MOCK_EMAIL} isPasswordNeeded />
);

export const PasswordNotNeeded = () => (
  <SigninWithProvider email={MOCK_EMAIL} isPasswordNeeded={false} />
);

export const PasswordNotNeededCustomServiceName = () => (
  <SigninWithProvider
    email={MOCK_EMAIL}
    isPasswordNeeded={false}
    serviceName={MOCK_SERVICE}
  />
);

export const PasswordNeededCustomServiceName = () => (
  <SigninWithProvider
    email={MOCK_EMAIL}
    isPasswordNeeded={true}
    serviceName={MOCK_SERVICE}
  />
);

export const IsPocketClient = () => (
  <SigninWithProvider
    email={MOCK_EMAIL}
    isPasswordNeeded={false}
    serviceName={MozServices.Pocket}
  />
);
