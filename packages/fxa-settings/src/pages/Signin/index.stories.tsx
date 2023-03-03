/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Signin, { SigninProps } from '.';
import { MozServices } from '../../lib/types';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MOCK_SERVICE } from './mocks';
import { withLocalization } from '../../../.storybook/decorators';

export default {
  title: 'Pages/Signin',
  component: Signin,
  decorators: [withLocalization],
} as Meta;

// TODO: Add in error and success states when the Banner is added in
const SigninWithProvider = ({ isPasswordNeeded, serviceName }: SigninProps) => {
  return (
    <LocationProvider>
      <Signin {...{ isPasswordNeeded, serviceName }} />
    </LocationProvider>
  );
};

export const PasswordNeeded = () => <SigninWithProvider isPasswordNeeded />;

export const PasswordNotNeeded = () => (
  <SigninWithProvider isPasswordNeeded={false} />
);

export const PasswordNotNeededCustomServiceName = () => (
  <SigninWithProvider isPasswordNeeded={false} serviceName={MOCK_SERVICE} />
);

export const PasswordNeededCustomServiceName = () => (
  <SigninWithProvider isPasswordNeeded={true} serviceName={MOCK_SERVICE} />
);

export const IsPocketClient = () => (
  <SigninWithProvider
    isPasswordNeeded={false}
    serviceName={MozServices.Pocket}
  />
);
